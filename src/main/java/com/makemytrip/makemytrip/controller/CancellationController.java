package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.services.CancellationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class CancellationController {

    @Autowired
    private CancellationService cancellationService;

    @PostMapping("/booking/cancel")
    public ResponseEntity<Users.Booking> cancelBooking(
            @RequestParam String userId,
            @RequestParam String bookingId,
            @RequestParam String reason) {
        Users.Booking booking = cancellationService.cancelBooking(userId, bookingId, reason);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/admin/refund/{userId}/{bookingId}")
    public ResponseEntity<Users.Booking> updateRefundStatus(
            @PathVariable String userId,
            @PathVariable String bookingId,
            @RequestParam String status) {
        Users.Booking booking = cancellationService.updateRefundStatus(userId, bookingId, status);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/admin/refund/auto-complete")
    public ResponseEntity<String> autoCompleteRefunds() {
        cancellationService.autoCompleteRefunds();
        return ResponseEntity.ok("Auto-complete refunds processed");
    }
}
