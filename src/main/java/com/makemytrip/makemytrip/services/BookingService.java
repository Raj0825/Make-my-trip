package com.makemytrip.makemytrip.services;
import com.makemytrip.makemytrip.models.*;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.TrainRepository;
import com.makemytrip.makemytrip.repositories.BusRepository;
import com.makemytrip.makemytrip.repositories.CabRepository;
import com.makemytrip.makemytrip.repositories.HomestayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private CabRepository cabRepository;

    @Autowired
    private HomestayRepository homestayRepository;

    @Autowired
    private FlightSeatService flightSeatService;

    @Autowired
    private RoomTypeService roomTypeService;

    public Users.Booking bookFlight(String userId, String flightId, int seats, double price, String seatNumbersCsv){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Flight> flightOptional =flightRepository.findById(flightId);
        if(usersOptional.isPresent() && flightOptional.isPresent()){
            Users user=usersOptional.get();
            Flight flight=flightOptional.get();
            if(flight.getAvailableSeats() >= seats){

                List<String> seatNumbers = null;
                if (seatNumbersCsv != null && !seatNumbersCsv.isBlank()) {
                    seatNumbers = Arrays.stream(seatNumbersCsv.split(","))
                            .map(String::trim).filter(s -> !s.isEmpty()).toList();
                    if (seatNumbers.isEmpty()) seatNumbers = null;
                    else if (seatNumbers.size() != seats) {
                        throw new RuntimeException("Number of selected seats must match number of tickets");
                    }
                }

                // Validate + reserve specific seats FIRST — if this throws (e.g. a seat
                // was just taken by someone else), nothing else has been modified yet.
                String seatBookingRef = null;
                if (seatNumbers != null) {
                    seatBookingRef = userId + ":" + flightId + ":" + System.currentTimeMillis();
                    flightSeatService.bookSeats(flightId, seatNumbers, userId, seatBookingRef);
                }

                flight.setAvailableSeats(flight.getAvailableSeats()- seats);
                flightRepository.save(flight);

                Users.Booking booking=new Users.Booking();
                booking.setType("Flight");
                booking.setBookingId(flightId);
                booking.setDate(LocalDate.now().toString());
                booking.setQuantity(seats);
                booking.setTotalPrice(price);
                if (seatNumbers != null) booking.setSeatNumbers(seatNumbers);

                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough seats available");
            }
        }
        throw new RuntimeException("User or flight not found");
    }
    public Users.Booking bookhotel(String userId, String hotelId, int rooms, double price, String roomTypeId, String roomTypeName){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Hotel> hotelOptional = hotelRepository.findById(hotelId);
        if(usersOptional.isPresent() && hotelOptional.isPresent()){
            Users user=usersOptional.get();
            Hotel hotel=hotelOptional.get();
            if(hotel.getAvailableRooms() >= rooms){
                hotel.setAvailableRooms(hotel.getAvailableRooms()- rooms);
                hotelRepository.save(hotel);

                if (roomTypeId != null && !roomTypeId.isBlank()) {
                    roomTypeService.bookRoom(roomTypeId, rooms);
                }

                Users.Booking booking=new Users.Booking();
                booking.setType("Hotel");
                booking.setBookingId(hotelId);
                booking.setDate(LocalDate.now().toString());
                booking.setQuantity(rooms);
                booking.setTotalPrice(price);
                if (roomTypeName != null && !roomTypeName.isBlank()) {
                    booking.setRoomType(roomTypeName);
                }
                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough rooms available");
            }
        }
        throw new RuntimeException("User or flight not found");
    }

    public Users.Booking booktrain(String userId, String trainId, int seats, double price){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Train> trainOptional =trainRepository.findById(trainId);
        if(usersOptional.isPresent() && trainOptional.isPresent()){
            Users user=usersOptional.get();
            Train train=trainOptional.get();
            if(train.getAvailableSeats() >= seats){
                train.setAvailableSeats(train.getAvailableSeats()- seats);
                trainRepository.save(train);

                Users.Booking booking=new Users.Booking();
                booking.setType("Train");
                booking.setBookingId(trainId);
                booking.setDate(LocalDate.now().toString());
                booking.setQuantity(seats);
                booking.setTotalPrice(price);
                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough seats available");
            }
        }
        throw new RuntimeException("User or train not found");
    }

    public Users.Booking bookbus(String userId, String busId, int seats, double price){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Bus> busOptional =busRepository.findById(busId);
        if(usersOptional.isPresent() && busOptional.isPresent()){
            Users user=usersOptional.get();
            Bus bus=busOptional.get();
            if(bus.getAvailableSeats() >= seats){
                bus.setAvailableSeats(bus.getAvailableSeats()- seats);
                busRepository.save(bus);

                Users.Booking booking=new Users.Booking();
                booking.setType("Bus");
                booking.setBookingId(busId);
                booking.setDate(LocalDate.now().toString());
                booking.setQuantity(seats);
                booking.setTotalPrice(price);
                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough seats available");
            }
        }
        throw new RuntimeException("User or bus not found");
    }

    public Users.Booking bookcab(String userId, String cabId, int seats, double price){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Cab> cabOptional =cabRepository.findById(cabId);
        if(usersOptional.isPresent() && cabOptional.isPresent()){
            Users user=usersOptional.get();
            Cab cab=cabOptional.get();
            if(cab.getAvailableSeats() >= seats){
                cab.setAvailableSeats(cab.getAvailableSeats()- seats);
                cabRepository.save(cab);

                Users.Booking booking=new Users.Booking();
                booking.setType("Cab");
                booking.setBookingId(cabId);
                booking.setDate(LocalDate.now().toString());
                booking.setQuantity(seats);
                booking.setTotalPrice(price);
                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough seats available");
            }
        }
        throw new RuntimeException("User or cab not found");
    }

    public Users.Booking bookhomestay(String userId, String homestayId, int rooms, double price){
        Optional<Users> usersOptional =userRepository.findById(userId);
        Optional<Homestay> homestayOptional = homestayRepository.findById(homestayId);
        if(usersOptional.isPresent() && homestayOptional.isPresent()){
            Users user=usersOptional.get();
            Homestay homestay=homestayOptional.get();
            if(homestay.getAvailableRooms() >= rooms){
                homestay.setAvailableRooms(homestay.getAvailableRooms()- rooms);
                homestayRepository.save(homestay);

                Users.Booking booking=new Users.Booking();
                booking.setType("Homestay");
                booking.setBookingId(homestayId);
                booking.setDate(LocalDate.now().toString());
                booking.setQuantity(rooms);
                booking.setTotalPrice(price);
                user.getBookings().add(booking);
                userRepository.save(user);
                return booking;
            }else {
                throw new RuntimeException("Not enough rooms available");
            }
        }
        throw new RuntimeException("User or homestay not found");
    }

}