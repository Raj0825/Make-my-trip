package com.makemytrip.makemytrip.controllers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Train;
import com.makemytrip.makemytrip.models.Bus;
import com.makemytrip.makemytrip.models.Cab;
import com.makemytrip.makemytrip.models.Homestay;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.TrainRepository;
import com.makemytrip.makemytrip.repositories.BusRepository;
import com.makemytrip.makemytrip.repositories.CabRepository;
import com.makemytrip.makemytrip.repositories.HomestayRepository;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    @Autowired
    private UserRepository userRepository;

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

    @GetMapping("/users")
    public ResponseEntity<List<Users>> getallusers(){
        List<Users> users=userRepository.findAll();
        return ResponseEntity.ok(users);
    }
    @PostMapping("/flight")
    public Flight addflight(@RequestBody Flight flight){
        return flightRepository.save(flight);
    }

    @PostMapping("/hotel")
    public Hotel addhotel(@RequestBody Hotel hotel){
        return hotelRepository.save(hotel);
    }
    @PutMapping("flight/{id}")
    public ResponseEntity<Flight> editflight(@PathVariable String id, @RequestBody Flight updatedFlight){
        Optional<Flight> flightOptional=flightRepository.findById(id);
        if(flightOptional.isPresent()){
            Flight flight = flightOptional.get();
            flight.setFlightName(updatedFlight.getFlightName());
            flight.setFrom(updatedFlight.getFrom());
            flight.setTo(updatedFlight.getTo());
            flight.setDepartureTime(updatedFlight.getDepartureTime());
            flight.setArrivalTime(updatedFlight.getArrivalTime());
            flight.setPrice(updatedFlight.getPrice());
            flight.setAvailableSeats(updatedFlight.getAvailableSeats());
            flightRepository.save(flight);
            return  ResponseEntity.ok(flight);
        }
        return ResponseEntity.notFound().build();
    }
    @PutMapping("hotel/{id}")
    public ResponseEntity<Hotel> editHotel (@PathVariable String id, @RequestBody Hotel updatedHotel){
        Optional<Hotel> hotelOptional=hotelRepository.findById(id);
        if(hotelOptional.isPresent()){
            Hotel hotel = hotelOptional.get();
            hotel.sethotelName(updatedHotel.gethotelName());
            hotel.setLocation(updatedHotel.getLocation());
            hotel.setAvailableRooms(updatedHotel.getAvailableRooms());
            hotel.setPricePerNight(updatedHotel.getPricePerNight());
            hotel.setamenities((updatedHotel.getamenities()));
            hotelRepository.save(hotel);
            return ResponseEntity.ok(hotel);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/train")
    public Train addtrain(@RequestBody Train train){
        return trainRepository.save(train);
    }

    @PutMapping("train/{id}")
    public ResponseEntity<Train> edittrain(@PathVariable String id, @RequestBody Train updatedTrain){
        Optional<Train> trainOptional=trainRepository.findById(id);
        if(trainOptional.isPresent()){
            Train train = trainOptional.get();
            train.setTrainName(updatedTrain.getTrainName());
            train.setFrom(updatedTrain.getFrom());
            train.setTo(updatedTrain.getTo());
            train.setDepartureTime(updatedTrain.getDepartureTime());
            train.setArrivalTime(updatedTrain.getArrivalTime());
            train.setPrice(updatedTrain.getPrice());
            train.setAvailableSeats(updatedTrain.getAvailableSeats());
            trainRepository.save(train);
            return ResponseEntity.ok(train);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/bus")
    public Bus addbus(@RequestBody Bus bus){
        return busRepository.save(bus);
    }

    @PutMapping("bus/{id}")
    public ResponseEntity<Bus> editbus(@PathVariable String id, @RequestBody Bus updatedBus){
        Optional<Bus> busOptional=busRepository.findById(id);
        if(busOptional.isPresent()){
            Bus bus = busOptional.get();
            bus.setBusName(updatedBus.getBusName());
            bus.setFrom(updatedBus.getFrom());
            bus.setTo(updatedBus.getTo());
            bus.setDepartureTime(updatedBus.getDepartureTime());
            bus.setArrivalTime(updatedBus.getArrivalTime());
            bus.setPrice(updatedBus.getPrice());
            bus.setAvailableSeats(updatedBus.getAvailableSeats());
            busRepository.save(bus);
            return ResponseEntity.ok(bus);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/cab")
    public Cab addcab(@RequestBody Cab cab){
        return cabRepository.save(cab);
    }

    @PutMapping("cab/{id}")
    public ResponseEntity<Cab> editcab(@PathVariable String id, @RequestBody Cab updatedCab){
        Optional<Cab> cabOptional=cabRepository.findById(id);
        if(cabOptional.isPresent()){
            Cab cab = cabOptional.get();
            cab.setCabType(updatedCab.getCabType());
            cab.setFrom(updatedCab.getFrom());
            cab.setTo(updatedCab.getTo());
            cab.setDepartureTime(updatedCab.getDepartureTime());
            cab.setArrivalTime(updatedCab.getArrivalTime());
            cab.setPrice(updatedCab.getPrice());
            cab.setAvailableSeats(updatedCab.getAvailableSeats());
            cabRepository.save(cab);
            return ResponseEntity.ok(cab);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/homestay")
    public Homestay addhomestay(@RequestBody Homestay homestay){
        return homestayRepository.save(homestay);
    }

    @PutMapping("homestay/{id}")
    public ResponseEntity<Homestay> edithomestay(@PathVariable String id, @RequestBody Homestay updatedHomestay){
        Optional<Homestay> homestayOptional=homestayRepository.findById(id);
        if(homestayOptional.isPresent()){
            Homestay homestay = homestayOptional.get();
            homestay.sethomestayName(updatedHomestay.gethomestayName());
            homestay.setLocation(updatedHomestay.getLocation());
            homestay.setAvailableRooms(updatedHomestay.getAvailableRooms());
            homestay.setPricePerNight(updatedHomestay.getPricePerNight());
            homestay.setamenities(updatedHomestay.getamenities());
            homestayRepository.save(homestay);
            return ResponseEntity.ok(homestay);
        }
        return ResponseEntity.notFound().build();
    }

}
