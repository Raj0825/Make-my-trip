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

        java.time.LocalDate minDate = java.time.LocalDate.of(2026, 9, 19);
        java.time.LocalDate maxDate = java.time.LocalDate.of(2026, 10, 19);

        for (com.makemytrip.makemytrip.models.Flight f : flightRepository.findAll()) {
            java.time.LocalDate d = java.time.LocalDate.parse(f.getDate());
            assertTrue(!d.isBefore(minDate) && !d.isAfter(maxDate),
                    "Flight " + f.getFlightName() + " date " + f.getDate() + " out of range");
            assertTrue(f.getDepartureTime().startsWith(f.getDate()),
                    "Flight departureTime should start with date: " + f.getDepartureTime());
        }

        for (com.makemytrip.makemytrip.models.Train t : trainRepository.findAll()) {
            java.time.LocalDate d = java.time.LocalDate.parse(t.getDate());
            assertTrue(!d.isBefore(minDate) && !d.isAfter(maxDate),
                    "Train " + t.getTrainName() + " date " + t.getDate() + " out of range");
            assertTrue(t.getDepartureTime().startsWith(t.getDate()),
                    "Train departureTime should start with date: " + t.getDepartureTime());
        }

        System.out.println("=== Sample Flights With Random Dates ===");
        flightRepository.findAll().stream().limit(5).forEach(f ->
                System.out.println("Flight: " + f.getFlightName() + " | Date: " + f.getDate() + " | Dep: " + f.getDepartureTime() + " | Arr: " + f.getArrivalTime()));

        System.out.println("=== Sample Trains With Random Dates ===");
        trainRepository.findAll().stream().limit(5).forEach(t ->
                System.out.println("Train: " + t.getTrainName() + " | Date: " + t.getDate() + " | Dep: " + t.getDepartureTime() + " | Arr: " + t.getArrivalTime()));

        System.out.println("=== ALL ASSERTIONS PASSED SUCCESSFULLY! ===");
    }
}
