package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.FlightTracking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FlightTrackingRepository extends MongoRepository<FlightTracking, String> {
    List<FlightTracking> findByUserId(String userId);
    List<FlightTracking> findByFlightId(String flightId);
    Optional<FlightTracking> findByUserIdAndFlightId(String userId, String flightId);
    void deleteByUserIdAndFlightId(String userId, String flightId);
}