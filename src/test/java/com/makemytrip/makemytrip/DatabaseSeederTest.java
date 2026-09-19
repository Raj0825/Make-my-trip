package com.makemytrip.makemytrip;

import com.makemytrip.makemytrip.config.DatabaseSeeder;
import com.makemytrip.makemytrip.repositories.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class DatabaseSeederTest {

    @Autowired
    private DatabaseSeeder databaseSeeder;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private HomestayRepository homestayRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private BusRepository busRepository;

    @Autowired
    private CabRepository cabRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testSeedDatabase() {
        System.out.println("=== Starting Database Seeding Execution ===");
        Map<String, Object> results = databaseSeeder.seedAll(false);
        System.out.println("Seeding Results: " + results);

        long flights = flightRepository.count();
        long hotels = hotelRepository.count();
        long homestays = homestayRepository.count();
        long trains = trainRepository.count();
        long buses = busRepository.count();
        long cabs = cabRepository.count();
        long users = userRepository.count();

        System.out.println("=== Verified Database Counts ===");
        System.out.println("Flights count: " + flights);
        System.out.println("Hotels count: " + hotels);
        System.out.println("Homestays count: " + homestays);
        System.out.println("Trains count: " + trains);
        System.out.println("Buses count: " + buses);
        System.out.println("Cabs count: " + cabs);
        System.out.println("Users count: " + users);

        assertTrue(flights >= 40, "Flights count must be >= 40, found: " + flights);
        assertTrue(hotels >= 50, "Hotels count must be >= 50, found: " + hotels);
        assertTrue(homestays >= 20, "Homestays count must be >= 20, found: " + homestays);
        assertTrue(trains >= 30, "Trains count must be >= 30, found: " + trains);
        assertTrue(buses >= 30, "Buses count must be >= 30, found: " + buses);
        assertTrue(cabs >= 40, "Cabs count must be >= 40, found: " + cabs);
        System.out.println("=== ALL ASSERTIONS PASSED SUCCESSFULLY! ===");
    }
}
