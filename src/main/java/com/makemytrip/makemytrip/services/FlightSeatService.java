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

    // Returns the seat map for a flight, generating it the first time it's requested.
    // The number of rows is sized off the flight's configured seat count so it
    // stays consistent with whatever the admin set up. Rows are carved front-to-back
    // into cabin sections proportional to total rows, so smaller flights simply have
    // fewer (or no) seats in the premium sections rather than breaking.
    public List<FlightSeat> getOrCreateSeatMap(String flightId) {
        List<FlightSeat> existing = flightSeatRepository.findByFlightId(flightId);
        boolean usesOldScheme = existing.stream().anyMatch(s -> !KNOWN_CLASSES.contains(s.getSeatClass()));
        if (!existing.isEmpty() && !usesOldScheme) return existing;
        if (usesOldScheme) {
            flightSeatRepository.deleteAll(existing); // self-heal seat maps generated before cabin classes existed
        }

        int totalSeats = flightRepository.findById(flightId)
                .map(Flight::getAvailableSeats)
                .orElse(60);
        int rows = Math.max(1, (int) Math.ceil(totalSeats / (double) COLUMNS.length));

        int firstRows = (int) Math.round(rows * 0.10);
        int businessRows = (int) Math.round(rows * 0.20);
        int premiumEconomyRows = (int) Math.round(rows * 0.20);
        // whatever's left (always >= 0 since the three ratios above sum to 0.5) is Economy

        List<FlightSeat> seats = new ArrayList<>();
        for (int row = 1; row <= rows; row++) {
            String seatClass;
            if (row <= firstRows) {
                seatClass = FIRST;
            } else if (row <= firstRows + businessRows) {
                seatClass = BUSINESS;
            } else if (row <= firstRows + businessRows + premiumEconomyRows) {
                seatClass = PREMIUM_ECONOMY;
            } else {
                seatClass = ECONOMY;
            }
            for (String col : COLUMNS) {
                FlightSeat seat = new FlightSeat();
                seat.setFlightId(flightId);
                seat.setSeatNumber(row + col);
                seat.setSeatClass(seatClass);
                seat.setSurcharge(0); // cabin pricing is handled by the class multiplier at booking, not a per-seat surcharge
                seat.setStatus("AVAILABLE");
                seats.add(seat);
            }
        }
        return flightSeatRepository.saveAll(seats);
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