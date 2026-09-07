package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.services.SeatInventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/seats")
@CrossOrigin(origins = "*")
public class SeatController {

    @Autowired
    private SeatInventoryService seatInventoryService;

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<String>> getBookedSeats(@PathVariable String entityType, @PathVariable String entityId) {
        return ResponseEntity.ok(seatInventoryService.getBookedSeatNumbers(entityType, entityId));
    }
}