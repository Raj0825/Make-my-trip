package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.FlightStatus;
import com.makemytrip.makemytrip.models.FlightTracking;
import com.makemytrip.makemytrip.services.FlightStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/flight-status")
@CrossOrigin(origins = "*")
public class FlightStatusController {

    @Autowired
    private FlightStatusService flightStatusService;

    // Live status for one flight — used on the flight detail page.
    @GetMapping("/{flightId}")
    public ResponseEntity<FlightStatus> getStatus(@PathVariable String flightId) {
        return ResponseEntity.ok(flightStatusService.getOrCreateStatus(flightId));
    }

    // Start tracking a flight (creates status record if needed).
    @PostMapping("/track")
    public ResponseEntity<FlightTracking> track(@RequestParam String userId, @RequestParam String flightId) {
        return ResponseEntity.ok(flightStatusService.track(userId, flightId));
    }

    @DeleteMapping("/track")
    public ResponseEntity<?> untrack(@RequestParam String userId, @RequestParam String flightId) {
        flightStatusService.untrack(userId, flightId);
        return ResponseEntity.ok().build();
    }

    // Dashboard: every flight this user is tracking, with live status joined in.
    @GetMapping("/tracked/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTracked(@PathVariable String userId) {
        return ResponseEntity.ok(flightStatusService.getTrackedFlightsWithStatus(userId));
    }
}