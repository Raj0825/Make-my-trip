package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.FlightSeat;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.FlightSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FlightSeatService {

    @Autowired private FlightSeatRepository flightSeatRepository;
    @Autowired private FlightRepository flightRepository;

    private static final String[] COLUMNS = {"A", "B", "C", "D", "E", "F"};

    // Cabin sections, front to back of the plane - names match the Cabin Class
    // picker on the booking page exactly, so the seat map can be filtered by it.
    private static final String FIRST = "First Class";
    private static final String BUSINESS = "Business";
    private static final String PREMIUM_ECONOMY = "Premium Economy";
    private static final String ECONOMY = "Economy";
    private static final java.util.Set<String> KNOWN_CLASSES =
            java.util.Set.of(FIRST, BUSINESS, PREMIUM_ECONOMY, ECONOMY);

    // Each cabin section gets its own short prefix so seat numbers stay unique across
    // sections while the row number still restarts at 1 within each section
    // (e.g. First Class: F1A, F1B... ; Business: J1A, J1B... ; Economy: 1A, 1B...).
    private static String prefixFor(String seatClass) {
        return switch (seatClass) {
            case FIRST -> "F";
            case BUSINESS -> "J";
            case PREMIUM_ECONOMY -> "W";
            default -> ""; // Economy keeps plain, familiar seat numbers
        };
    }

    // Returns the seat map for a flight, generating it the first time it's requested.
    // Uses the exact per-class seat counts the admin configured on the flight. If an
    // older flight never had those set (all zero), falls back to a proportional split
    // of its total seat count so nothing breaks for pre-existing data.
    public List<FlightSeat> getOrCreateSeatMap(String flightId) {
        List<FlightSeat> existing = flightSeatRepository.findByFlightId(flightId);
        boolean usesOldScheme = existing.stream().anyMatch(s -> !KNOWN_CLASSES.contains(s.getSeatClass()));
        if (!existing.isEmpty() && !usesOldScheme) return existing;
        if (usesOldScheme) {
            flightSeatRepository.deleteAll(existing); // self-heal seat maps generated before cabin classes existed
        }

        Flight flight = flightRepository.findById(flightId).orElse(null);

        int firstCount = flight != null ? flight.getFirstClassSeats() : 0;
        int businessCount = flight != null ? flight.getBusinessSeats() : 0;
        int premiumEconomyCount = flight != null ? flight.getPremiumEconomySeats() : 0;
        int economyCount = flight != null ? flight.getEconomySeats() : 0;

        boolean adminConfigured = firstCount + businessCount + premiumEconomyCount + economyCount > 0;
        if (!adminConfigured) {
            // Legacy fallback: no per-class counts set, split the total proportionally.
            int totalSeats = flight != null ? flight.getAvailableSeats() : 60;
            firstCount = (int) Math.round(totalSeats * 0.10);
            businessCount = (int) Math.round(totalSeats * 0.20);
            premiumEconomyCount = (int) Math.round(totalSeats * 0.20);
            economyCount = Math.max(0, totalSeats - firstCount - businessCount - premiumEconomyCount);
        }

        List<FlightSeat> seats = new ArrayList<>();
        seats.addAll(generateSection(flightId, FIRST, firstCount));
        seats.addAll(generateSection(flightId, BUSINESS, businessCount));
        seats.addAll(generateSection(flightId, PREMIUM_ECONOMY, premiumEconomyCount));
        seats.addAll(generateSection(flightId, ECONOMY, economyCount));

        return flightSeatRepository.saveAll(seats);
    }

    // Generates one cabin section's seats, with its own row numbering starting at 1.
    private List<FlightSeat> generateSection(String flightId, String seatClass, int seatCount) {
        List<FlightSeat> seats = new ArrayList<>();
        if (seatCount <= 0) return seats;

        String prefix = prefixFor(seatClass);
        int rows = Math.max(1, (int) Math.ceil(seatCount / (double) COLUMNS.length));
        int remaining = seatCount;

        for (int row = 1; row <= rows; row++) {
            for (String col : COLUMNS) {
                if (remaining <= 0) break;
                FlightSeat seat = new FlightSeat();
                seat.setFlightId(flightId);
                seat.setSeatNumber(prefix + row + col);
                seat.setSeatClass(seatClass);
                seat.setSurcharge(0); // cabin pricing is handled by the class multiplier at booking, not a per-seat surcharge
                seat.setStatus("AVAILABLE");
                seats.add(seat);
                remaining--;
            }
        }
        return seats;
    }

    // Validates the requested seats are all still available, then books them.
    public List<FlightSeat> bookSeats(String flightId, List<String> seatNumbers, String userId, String bookingId) {
        List<FlightSeat> seatMap = getOrCreateSeatMap(flightId);

        List<FlightSeat> toBook = seatMap.stream()
                .filter(s -> seatNumbers.contains(s.getSeatNumber()))
                .toList();

        if (toBook.size() != seatNumbers.size()) {
            throw new RuntimeException("One or more selected seats don't exist on this flight");
        }
        for (FlightSeat seat : toBook) {
            if (!"AVAILABLE".equals(seat.getStatus())) {
                throw new RuntimeException("Seat " + seat.getSeatNumber() + " is no longer available");
            }
        }

        for (FlightSeat seat : toBook) {
            seat.setStatus("BOOKED");
            seat.setBookedByUserId(userId);
            seat.setBookingId(bookingId);
        }
        return flightSeatRepository.saveAll(toBook);
    }

    // Frees up seats when a booking is cancelled.
    public void releaseSeatsByBookingId(String bookingId) {
        List<FlightSeat> seats = flightSeatRepository.findByBookingId(bookingId);
        for (FlightSeat seat : seats) {
            seat.setStatus("AVAILABLE");
            seat.setBookedByUserId(null);
            seat.setBookingId(null);
        }
        flightSeatRepository.saveAll(seats);
    }

    // Simpler release path used by cancellation — the cancelling code already
    // has the exact seat numbers from the booking record, so no lookup by
    // bookingId reference is needed.
    public void releaseSeats(String flightId, List<String> seatNumbers) {
        if (seatNumbers == null || seatNumbers.isEmpty()) return;
        List<FlightSeat> seatMap = flightSeatRepository.findByFlightId(flightId);
        List<FlightSeat> toRelease = seatMap.stream()
                .filter(s -> seatNumbers.contains(s.getSeatNumber()))
                .toList();
        for (FlightSeat seat : toRelease) {
            seat.setStatus("AVAILABLE");
            seat.setBookedByUserId(null);
            seat.setBookingId(null);
        }
        flightSeatRepository.saveAll(toRelease);
    }

    // Total extra cost of the selected seats over base fare (e.g. premium surcharge).
    public double calculateSurcharge(String flightId, List<String> seatNumbers) {
        List<FlightSeat> seatMap = getOrCreateSeatMap(flightId);
        return seatMap.stream()
                .filter(s -> seatNumbers.contains(s.getSeatNumber()))
                .mapToDouble(FlightSeat::getSurcharge)
                .sum();
    }
}