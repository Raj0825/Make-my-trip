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

    @GetMapping("/train")
    public ResponseEntity<List<Train>> getalltrains(){
        return ResponseEntity.ok(trainRepository.findAll());
    }

    @GetMapping("/bus")
    public ResponseEntity<List<Bus>> getallbuses(){
        return ResponseEntity.ok(busRepository.findAll());
    }

    @GetMapping("/cab")
    public ResponseEntity<List<Cab>> getallcabs(){
        return ResponseEntity.ok(cabRepository.findAll());
    }

    @GetMapping("/homestay")
    public ResponseEntity<List<Homestay>> getallhomestays(){
        return ResponseEntity.ok(homestayRepository.findAll());
    }
}