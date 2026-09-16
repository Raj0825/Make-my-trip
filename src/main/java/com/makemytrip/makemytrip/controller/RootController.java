package com.makemytrip.makemytrip.controller;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Train;
import com.makemytrip.makemytrip.models.Bus;
import com.makemytrip.makemytrip.models.Cab;
import com.makemytrip.makemytrip.models.Homestay;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.TrainRepository;
import com.makemytrip.makemytrip.repositories.BusRepository;
import com.makemytrip.makemytrip.repositories.CabRepository;
import com.makemytrip.makemytrip.repositories.HomestayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class RootController {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private CabRepository cabRepository;

    @Autowired
    private HomestayRepository homestayRepository;

    @GetMapping("/")
    public String home() {
        return "✅ It's running on port 8080!";
    }

    @GetMapping("/hotel")
    public ResponseEntity<List<Hotel>> getallhotel(){
        return ResponseEntity.ok(hotelRepository.findAll());
    }

    @DeleteMapping(value = {"/hotel/{id}", "hotel/{id}"})
    public ResponseEntity<?> deleteHotel(@PathVariable String id) {
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Hotel ID cannot be empty"));
        }
        id = id.trim();
        java.util.Optional<Hotel> hotelOptional = hotelRepository.findById(id);
        if (hotelOptional.isPresent()) {
            hotelRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Hotel deleted successfully", "id", id));
        }
        for (Hotel h : hotelRepository.findAll()) {
            if (id.equals(h.getId())) {
                hotelRepository.delete(h);
                return ResponseEntity.ok(java.util.Map.of("message", "Hotel deleted successfully", "id", id));
            }
        }
        return ResponseEntity.status(404).body(java.util.Map.of("error", "Hotel not found with id: " + id));
    }

    @GetMapping("/flight")
    public ResponseEntity<List<Flight>> getallflights(){
        return ResponseEntity.ok(flightRepository.findAll());
    }

    @DeleteMapping(value = {"/flight/{id}", "flight/{id}"})
    public ResponseEntity<?> deleteFlight(@PathVariable String id) {
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Flight ID cannot be empty"));
        }
        id = id.trim();
        java.util.Optional<Flight> flightOptional = flightRepository.findById(id);
        if (flightOptional.isPresent()) {
            flightRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Flight deleted successfully", "id", id));
        }
        for (Flight f : flightRepository.findAll()) {
            if (id.equals(f.getId())) {
                flightRepository.delete(f);
                return ResponseEntity.ok(java.util.Map.of("message", "Flight deleted successfully", "id", id));
            }
        }
        return ResponseEntity.status(404).body(java.util.Map.of("error", "Flight not found with id: " + id));
    }

    @GetMapping("/train")
    public ResponseEntity<List<Train>> getalltrains(){
        return ResponseEntity.ok(trainRepository.findAll());
    }

    @DeleteMapping(value = {"/train/{id}", "train/{id}"})
    public ResponseEntity<?> deleteTrain(@PathVariable String id) {
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Train ID cannot be empty"));
        }
        id = id.trim();
        java.util.Optional<Train> trainOptional = trainRepository.findById(id);
        if (trainOptional.isPresent()) {
            trainRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Train deleted successfully", "id", id));
        }
        for (Train t : trainRepository.findAll()) {
            if (id.equals(t.getId())) {
                trainRepository.delete(t);
                return ResponseEntity.ok(java.util.Map.of("message", "Train deleted successfully", "id", id));
            }
        }
        return ResponseEntity.status(404).body(java.util.Map.of("error", "Train not found with id: " + id));
    }

    @GetMapping("/bus")
    public ResponseEntity<List<Bus>> getallbuses(){
        return ResponseEntity.ok(busRepository.findAll());
    }

    @DeleteMapping(value = {"/bus/{id}", "bus/{id}"})
    public ResponseEntity<?> deleteBus(@PathVariable String id) {
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Bus ID cannot be empty"));
        }
        id = id.trim();
        java.util.Optional<Bus> busOptional = busRepository.findById(id);
        if (busOptional.isPresent()) {
            busRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Bus deleted successfully", "id", id));
        }
        for (Bus b : busRepository.findAll()) {
            if (id.equals(b.getId())) {
                busRepository.delete(b);
                return ResponseEntity.ok(java.util.Map.of("message", "Bus deleted successfully", "id", id));
            }
        }
        return ResponseEntity.status(404).body(java.util.Map.of("error", "Bus not found with id: " + id));
    }

    @GetMapping("/cab")
    public ResponseEntity<List<Cab>> getallcabs(){
        return ResponseEntity.ok(cabRepository.findAll());
    }

    @DeleteMapping(value = {"/cab/{id}", "cab/{id}"})
    public ResponseEntity<?> deleteCab(@PathVariable String id) {
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Cab ID cannot be empty"));
        }
        id = id.trim();
        java.util.Optional<Cab> cabOptional = cabRepository.findById(id);
        if (cabOptional.isPresent()) {
            cabRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Cab deleted successfully", "id", id));
        }
        for (Cab c : cabRepository.findAll()) {
            if (id.equals(c.getId())) {
                cabRepository.delete(c);
                return ResponseEntity.ok(java.util.Map.of("message", "Cab deleted successfully", "id", id));
            }
        }
        return ResponseEntity.status(404).body(java.util.Map.of("error", "Cab not found with id: " + id));
    }

    @GetMapping("/homestay")
    public ResponseEntity<List<Homestay>> getallhomestays(){
        return ResponseEntity.ok(homestayRepository.findAll());
    }

    @DeleteMapping(value = {"/homestay/{id}", "homestay/{id}"})
    public ResponseEntity<?> deleteHomestay(@PathVariable String id) {
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Homestay ID cannot be empty"));
        }
        id = id.trim();
        java.util.Optional<Homestay> homestayOptional = homestayRepository.findById(id);
        if (homestayOptional.isPresent()) {
            homestayRepository.deleteById(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Homestay deleted successfully", "id", id));
        }
        for (Homestay h : homestayRepository.findAll()) {
            if (id.equals(h.getId())) {
                homestayRepository.delete(h);
                return ResponseEntity.ok(java.util.Map.of("message", "Homestay deleted successfully", "id", id));
            }
        }
        return ResponseEntity.status(404).body(java.util.Map.of("error", "Homestay not found with id: " + id));
    }
}