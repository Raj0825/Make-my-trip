package com.makemytrip.makemytrip.controllers;
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