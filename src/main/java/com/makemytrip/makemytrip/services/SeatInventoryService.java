package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Seat;
import com.makemytrip.makemytrip.repositories.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeatInventoryService {

    @Autowired
    private SeatRepository seatRepository;

    /** Seat numbers already taken for this entity — the frontend marks these as booked/disabled. */
    public List<String> getBookedSeatNumbers(String entityType, String entityId) {
        return seatRepository.findByEntityTypeAndEntityId(entityType, entityId)
                .stream().map(Seat::getSeatNumber).toList();
    }

    /**
     * Reserves the given seat numbers for this booking. Throws (and reserves
     * nothing) if any one of them has already been taken by someone else —
     * the same seat can never be sold twice.
     */
    public List<Seat> bookSeats(String entityType, String entityId, List<String> seatNumbers, String userId, String bookingId) {
        if (seatNumbers == null || seatNumbers.isEmpty()) return new ArrayList<>();

        List<Seat> existing = seatRepository.findByEntityTypeAndEntityId(entityType, entityId);
        List<String> alreadyTaken = existing.stream().map(Seat::getSeatNumber).toList();

        for (String seatNumber : seatNumbers) {
            if (alreadyTaken.contains(seatNumber)) {
                throw new RuntimeException("Seat " + seatNumber + " is no longer available");
            }
        }

        List<Seat> toSave = new ArrayList<>();
        for (String seatNumber : seatNumbers) {
            Seat seat = new Seat();
            seat.setEntityType(entityType);
            seat.setEntityId(entityId);
            seat.setSeatNumber(seatNumber);
            seat.setBookedByUserId(userId);
            seat.setBookingId(bookingId);
            toSave.add(seat);
        }
        return seatRepository.saveAll(toSave);
    }

    /** Frees up seats when a booking is cancelled, by booking reference. */
    public void releaseSeatsByBookingId(String bookingId) {
        List<Seat> seats = seatRepository.findByBookingId(bookingId);
        seatRepository.deleteAll(seats);
    }

    /** Simpler release path used by cancellation — releases specific seat numbers for an entity directly. */
    public void releaseSeats(String entityType, String entityId, List<String> seatNumbers) {
        if (seatNumbers == null || seatNumbers.isEmpty()) return;
        List<Seat> existing = seatRepository.findByEntityTypeAndEntityId(entityType, entityId);
        List<Seat> toRelease = existing.stream()
                .filter(s -> seatNumbers.contains(s.getSeatNumber()))
                .toList();
        seatRepository.deleteAll(toRelease);
    }
}