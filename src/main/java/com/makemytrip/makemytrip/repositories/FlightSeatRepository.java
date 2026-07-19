package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.FlightSeat;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FlightSeatRepository extends MongoRepository<FlightSeat, String> {
    List<FlightSeat> findByFlightId(String flightId);
    List<FlightSeat> findByBookingId(String bookingId);
}