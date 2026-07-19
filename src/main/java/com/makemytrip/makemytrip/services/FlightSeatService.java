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
    private static final double PREMIUM_SURCHARGE = 500;
    private static final int PREMIUM_ROWS = 3; // first 3 rows are premium (extra legroom)

    // Returns the seat map for a flight, generating it the first time it's requested.
    // The number of rows is sized off the flight's configured seat count so it
    // stays consistent with whatever the admin set up.
    public List<FlightSeat> getOrCreateSeatMap(String flightId) {
        List<FlightSeat> existing = flightSeatRepository.findByFlightId(flightId);
        if (!existing.isEmpty()) return existing;

        int totalSeats = flightRepository.findById(flightId)
                .map(Flight::getAvailableSeats)
                .orElse(60);
        int rows = Math.max(1, (int) Math.ceil(totalSeats / (double) COLUMNS.length));

        List<FlightSeat> seats = new ArrayList<>();
        for (int row = 1; row <= rows; row++) {
            boolean isPremium = row <= PREMIUM_ROWS;
            for (String col : COLUMNS) {
                FlightSeat seat = new FlightSeat();
                seat.setFlightId(flightId);
                seat.setSeatNumber(row + col);
                seat.setSeatClass(isPremium ? "PREMIUM" : "ECONOMY");
                seat.setSurcharge(isPremium ? PREMIUM_SURCHARGE : 0);
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