package com.makemytrip.makemytrip.controller;
import com.makemytrip.makemytrip.models.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.makemytrip.makemytrip.services.BookingService;

@RestController
@RequestMapping("/booking")
@CrossOrigin(origins = "*")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping("/flight")
    public ResponseEntity<?> bookFlight(@RequestParam String userId, @RequestParam String flightId, @RequestParam int seats, @RequestParam double price){
        try {
            return ResponseEntity.ok(bookingService.bookFlight(userId,flightId,seats,price));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/hotel")
    public ResponseEntity<?> bookhotel (@RequestParam String userId,@RequestParam String hotelId,@RequestParam int rooms,@RequestParam double price){
        try {
            return ResponseEntity.ok(bookingService.bookhotel(userId,hotelId,rooms,price));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/train")
    public ResponseEntity<?> booktrain(@RequestParam String userId,@RequestParam String trainId,@RequestParam int seats,@RequestParam double price){
        try {
            return ResponseEntity.ok(bookingService.booktrain(userId,trainId,seats,price));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/bus")
    public ResponseEntity<?> bookbus(@RequestParam String userId,@RequestParam String busId,@RequestParam int seats,@RequestParam double price){
        try {
            return ResponseEntity.ok(bookingService.bookbus(userId,busId,seats,price));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/cab")
    public ResponseEntity<?> bookcab(@RequestParam String userId,@RequestParam String cabId,@RequestParam int seats,@RequestParam double price){
        try {
            return ResponseEntity.ok(bookingService.bookcab(userId,cabId,seats,price));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/homestay")
    public ResponseEntity<?> bookhomestay(@RequestParam String userId,@RequestParam String homestayId,@RequestParam int rooms,@RequestParam double price){
        try {
            return ResponseEntity.ok(bookingService.bookhomestay(userId,homestayId,rooms,price));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}