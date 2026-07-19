package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.FlightSeat;
import com.makemytrip.makemytrip.services.FlightSeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/flight-seats")
@CrossOrigin(origins = "*")
public class FlightSeatController {

    @Autowired
    private FlightSeatService flightSeatService;

    @GetMapping("/{flightId}")
    public ResponseEntity<List<FlightSeat>> getSeatMap(@PathVariable String flightId) {
        return ResponseEntity.ok(flightSeatService.getOrCreateSeatMap(flightId));
    }
}