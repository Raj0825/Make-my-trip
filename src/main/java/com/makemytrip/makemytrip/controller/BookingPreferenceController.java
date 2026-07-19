package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.BookingPreference;
import com.makemytrip.makemytrip.services.BookingPreferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/preferences")
@CrossOrigin(origins = "*")
public class BookingPreferenceController {

    @Autowired
    private BookingPreferenceService bookingPreferenceService;

    @GetMapping("/{userId}")
    public ResponseEntity<BookingPreference> getPreferences(@PathVariable String userId) {
        return ResponseEntity.ok(bookingPreferenceService.getPreferences(userId));
    }

    // body: { userId, seatType, seatClass, roomTypeName } — any field can be omitted
    @PostMapping
    public ResponseEntity<BookingPreference> savePreferences(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingPreferenceService.savePreferences(
                body.get("userId"), body.get("seatType"), body.get("seatClass"), body.get("roomTypeName")
        ));
    }
}