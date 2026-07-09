package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Train;
import com.makemytrip.makemytrip.models.Bus;
import com.makemytrip.makemytrip.models.Cab;
import com.makemytrip.makemytrip.models.Homestay;
import com.makemytrip.makemytrip.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class CancellationService {

    @Autowired private UserRepository userRepository;
    @Autowired private FlightRepository flightRepository;
    @Autowired private HotelRepository hotelRepository;
    @Autowired private TrainRepository trainRepository;
    @Autowired private BusRepository busRepository;
    @Autowired private CabRepository cabRepository;
    @Autowired private HomestayRepository homestayRepository;

    private static final int REFUND_COMPLETION_DAYS = 7;

    public Users.Booking cancelBooking(String userId, String bookingId, String reason) {
        Optional<Users> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        Users user = userOptional.get();
        Users.Booking targetBooking = user.getBookings().stream()
                .filter(b -> b.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (targetBooking.isCancelled()) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // Calculate refund: 50% if within 24hrs of booking date, 0% after
        double refundAmount = 0;
        try {
            String bookingDateStr = targetBooking.getDate();
            if (bookingDateStr != null) {
                LocalDateTime bookingDateTime = LocalDate.parse(bookingDateStr).atStartOfDay();
                LocalDateTime now = LocalDateTime.now();
                long hoursSinceBooking = java.time.Duration.between(bookingDateTime, now).toHours();
                if (hoursSinceBooking <= 24) {
                    refundAmount = targetBooking.getTotalPrice() * 0.5;
                }
            }
        } catch (Exception e) {
            // If date parsing fails, default to no refund
            refundAmount = 0;
        }

        // Restore inventory
        restoreInventory(targetBooking);

        // Set cancellation details
        String cancelledAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        String expectedRefundDate = LocalDate.now().plusDays(REFUND_COMPLETION_DAYS)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        targetBooking.setCancelled(true);
        targetBooking.setCancellationReason(reason);
        targetBooking.setRefundAmount(refundAmount);
        targetBooking.setRefundStatus(refundAmount > 0 ? "PENDING" : "NO_REFUND");
        targetBooking.setCancelledAt(cancelledAt);
        targetBooking.setExpectedRefundDate(refundAmount > 0 ? expectedRefundDate : null);

        userRepository.save(user);
        return targetBooking;
    }

    public Users.Booking updateRefundStatus(String userId, String bookingId, String status) {
        Optional<Users> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) throw new RuntimeException("User not found");

        Users user = userOptional.get();
        Users.Booking booking = user.getBookings().stream()
                .filter(b -> b.getBookingId().equals(bookingId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setRefundStatus(status);
        userRepository.save(user);
        return booking;
    }

    // Auto-complete refunds that are older than 7 days
    public void autoCompleteRefunds() {
        userRepository.findAll().forEach(user -> {
            boolean updated = false;
            for (Users.Booking booking : user.getBookings()) {
                if ("PENDING".equals(booking.getRefundStatus()) && booking.getCancelledAt() != null) {
                    try {
                        LocalDateTime cancelledAt = LocalDateTime.parse(
                                booking.getCancelledAt(),
                                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                        );
                        long daysSinceCancellation = java.time.Duration.between(cancelledAt, LocalDateTime.now()).toDays();
                        if (daysSinceCancellation >= REFUND_COMPLETION_DAYS) {
                            booking.setRefundStatus("COMPLETED");
                            updated = true;
                        } else if (daysSinceCancellation >= 1) {
                            booking.setRefundStatus("PROCESSED");
                            updated = true;
                        }
                    } catch (Exception ignored) {}
                }
            }
            if (updated) userRepository.save(user);
        });
    }

    private void restoreInventory(Users.Booking booking) {
        String type = booking.getType();
        String bookingId = booking.getBookingId();
        int quantity = booking.getQuantity();

        switch (type) {
            case "Flight" -> flightRepository.findById(bookingId).ifPresent(f -> {
                f.setAvailableSeats(f.getAvailableSeats() + quantity);
                flightRepository.save(f);
            });
            case "Hotel" -> hotelRepository.findById(bookingId).ifPresent(h -> {
                h.setAvailableRooms(h.getAvailableRooms() + quantity);
                hotelRepository.save(h);
            });
            case "Train" -> trainRepository.findById(bookingId).ifPresent(t -> {
                t.setAvailableSeats(t.getAvailableSeats() + quantity);
                trainRepository.save(t);
            });
            case "Bus" -> busRepository.findById(bookingId).ifPresent(b -> {
                b.setAvailableSeats(b.getAvailableSeats() + quantity);
                busRepository.save(b);
            });
            case "Cab" -> cabRepository.findById(bookingId).ifPresent(c -> {
                c.setAvailableSeats(c.getAvailableSeats() + quantity);
                cabRepository.save(c);
            });
            case "Homestay" -> homestayRepository.findById(bookingId).ifPresent(hs -> {
                hs.setAvailableRooms(hs.getAvailableRooms() + quantity);
                homestayRepository.save(hs);
            });
        }
    }
}
