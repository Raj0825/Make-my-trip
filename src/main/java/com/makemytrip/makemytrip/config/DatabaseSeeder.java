package com.makemytrip.makemytrip.config;

import com.makemytrip.makemytrip.models.*;
import com.makemytrip.makemytrip.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking database seeding status...");
        Map<String, Object> results = seedAll(false);
        log.info("Database seeding check complete: {}", results);
    }

    public synchronized Map<String, Object> seedAll(boolean force) {
        Map<String, Object> report = new LinkedHashMap<>();

        long flightCount = seedFlights(force);
        long hotelCount = seedHotels(force);
        long homestayCount = seedHomestays(force);
        long trainCount = seedTrains(force);
        long busCount = seedBuses(force);
        long cabCount = seedCabs(force);
        long demoBookingsCount = seedDemoBookings();

        report.put("flights", flightCount);
        report.put("hotels", hotelCount);
        report.put("homestays", homestayCount);
        report.put("trains", trainCount);
        report.put("buses", busCount);
        report.put("cabs", cabCount);
        report.put("demoBookings", demoBookingsCount);
        report.put("status", "SUCCESS");

        return report;
    }

    private long seedFlights(boolean force) {
        if (!force && flightRepository.count() >= 40) {
            return flightRepository.count();
        }

        List<Flight> list = new ArrayList<>();
        list.add(createFlight("IndiGo 6E-204", "Delhi", "Mumbai", "06:00", "08:15", 4800, 180, 12, 24, 24, 120));
        list.add(createFlight("Air India AI-102", "Delhi", "Mumbai", "07:00", "09:20", 5400, 190, 12, 24, 24, 130));
        list.add(createFlight("Vistara UK-945", "Delhi", "Mumbai", "08:30", "10:45", 5900, 160, 8, 20, 24, 108));
        list.add(createFlight("SpiceJet SG-8169", "Delhi", "Mumbai", "10:15", "12:30", 4200, 180, 0, 12, 18, 150));
        list.add(createFlight("Akasa Air QP-1122", "Delhi", "Mumbai", "14:00", "16:15", 4100, 180, 0, 12, 24, 144));
        list.add(createFlight("IndiGo 6E-5318", "Delhi", "Bengaluru", "06:30", "09:20", 6200, 180, 12, 24, 24, 120));
        list.add(createFlight("Air India AI-506", "Delhi", "Bengaluru", "09:45", "12:35", 6800, 190, 12, 24, 24, 130));
        list.add(createFlight("Vistara UK-811", "Delhi", "Bengaluru", "15:30", "18:20", 7100, 160, 8, 20, 24, 108));
        list.add(createFlight("IndiGo 6E-2015", "Delhi", "Goa", "09:10", "11:45", 5600, 180, 8, 18, 24, 130));
        list.add(createFlight("Air India AI-883", "Delhi", "Goa", "11:30", "14:05", 6100, 180, 8, 18, 24, 130));
        list.add(createFlight("Vistara UK-847", "Delhi", "Goa", "13:45", "16:20", 6500, 160, 8, 20, 24, 108));
        list.add(createFlight("Emirates EK-513", "Delhi", "Dubai", "04:15", "06:50", 18500, 250, 16, 36, 40, 158));
        list.add(createFlight("Air India AI-995", "Delhi", "Dubai", "20:00", "22:30", 14500, 200, 12, 28, 30, 130));
        list.add(createFlight("Singapore Airlines SQ-403", "Delhi", "Singapore", "09:50", "18:10", 24500, 280, 18, 42, 40, 180));
        list.add(createFlight("British Airways BA-142", "Delhi", "London", "03:15", "07:45", 48000, 300, 20, 48, 48, 184));
        list.add(createFlight("IndiGo 6E-205", "Delhi", "Kolkata", "06:15", "08:25", 4900, 180, 8, 18, 24, 130));
        list.add(createFlight("Air India AI-764", "Delhi", "Kolkata", "16:50", "19:00", 5300, 180, 10, 20, 20, 130));
        list.add(createFlight("IndiGo 6E-2184", "Delhi", "Chennai", "07:15", "10:10", 5800, 180, 8, 18, 24, 130));
        list.add(createFlight("Vistara UK-837", "Delhi", "Chennai", "17:00", "19:55", 6400, 160, 8, 20, 24, 108));
        list.add(createFlight("IndiGo 6E-6012", "Delhi", "Hyderabad", "08:45", "11:00", 4900, 180, 8, 18, 24, 130));
        list.add(createFlight("IndiGo 6E-2433", "Delhi", "Jaipur", "12:30", "13:35", 2900, 180, 0, 12, 18, 150));
        list.add(createFlight("Air India AI-477", "Delhi", "Srinagar", "11:15", "12:45", 6800, 160, 8, 16, 20, 116));
        list.add(createFlight("IndiGo 6E-2212", "Delhi", "Kochi", "05:45", "09:05", 7200, 180, 8, 18, 24, 130));
        list.add(createFlight("IndiGo 6E-5311", "Mumbai", "Delhi", "07:00", "09:15", 4900, 180, 12, 24, 24, 120));
        list.add(createFlight("Air India AI-806", "Mumbai", "Delhi", "13:00", "15:15", 5500, 190, 12, 24, 24, 130));
        list.add(createFlight("Vistara UK-996", "Mumbai", "Delhi", "18:30", "20:45", 6100, 160, 8, 20, 24, 108));
        list.add(createFlight("IndiGo 6E-5322", "Mumbai", "Bengaluru", "06:45", "08:25", 3800, 180, 8, 18, 24, 130));
        list.add(createFlight("Akasa Air QP-1371", "Mumbai", "Bengaluru", "10:30", "12:10", 3500, 180, 0, 12, 24, 144));
        list.add(createFlight("IndiGo 6E-5388", "Mumbai", "Goa", "11:15", "12:30", 3200, 180, 8, 18, 24, 130));
        list.add(createFlight("Vistara UK-861", "Mumbai", "Goa", "14:40", "15:55", 3900, 160, 8, 20, 24, 108));
        list.add(createFlight("Emirates EK-501", "Mumbai", "Dubai", "04:30", "06:15", 17500, 260, 16, 38, 40, 166));
        list.add(createFlight("Singapore Airlines SQ-421", "Mumbai", "Singapore", "11:45", "19:50", 23500, 275, 18, 40, 42, 175));
        list.add(createFlight("IndiGo 6E-5353", "Mumbai", "Jaipur", "09:00", "10:50", 4400, 180, 8, 18, 24, 130));
        list.add(createFlight("Air India AI-671", "Mumbai", "Chennai", "15:45", "17:40", 4300, 180, 10, 20, 20, 130));
        list.add(createFlight("IndiGo 6E-5334", "Mumbai", "Kolkata", "07:30", "10:10", 5700, 180, 8, 18, 24, 130));
        list.add(createFlight("IndiGo 6E-415", "Bengaluru", "Delhi", "06:00", "08:55", 6100, 180, 12, 24, 24, 120));
        list.add(createFlight("Vistara UK-812", "Bengaluru", "Delhi", "19:15", "22:10", 7200, 160, 8, 20, 24, 108));
        list.add(createFlight("IndiGo 6E-684", "Bengaluru", "Mumbai", "08:00", "09:40", 3900, 180, 8, 18, 24, 130));
        list.add(createFlight("IndiGo 6E-344", "Bengaluru", "Goa", "13:10", "14:25", 3100, 180, 8, 18, 24, 130));
        list.add(createFlight("Air India AI-511", "Bengaluru", "Hyderabad", "09:30", "10:45", 3300, 160, 8, 16, 20, 116));
        list.add(createFlight("IndiGo 6E-7164", "Bengaluru", "Kochi", "11:20", "12:35", 3100, 180, 8, 18, 24, 130));
        list.add(createFlight("IndiGo 6E-6112", "Kolkata", "Delhi", "08:15", "10:40", 5200, 180, 8, 18, 24, 130));
        list.add(createFlight("Air India AI-773", "Kolkata", "Mumbai", "11:00", "13:45", 5900, 180, 10, 20, 20, 130));
        list.add(createFlight("IndiGo 6E-544", "Chennai", "Delhi", "06:40", "09:35", 5900, 180, 8, 18, 24, 130));
        list.add(createFlight("Air India AI-545", "Chennai", "Mumbai", "10:15", "12:15", 4200, 180, 10, 20, 20, 130));
        list.add(createFlight("IndiGo 6E-824", "Hyderabad", "Delhi", "07:00", "09:15", 4900, 180, 8, 18, 24, 130));
        list.add(createFlight("IndiGo 6E-728", "Hyderabad", "Goa", "12:45", "14:10", 3600, 180, 8, 18, 24, 130));
        list.add(createFlight("Thai Airways TG-316", "Delhi", "Bangkok", "23:30", "05:25", 19800, 240, 14, 32, 34, 160));

        flightRepository.saveAll(list);
        log.info("Seeded {} flights into database.", list.size());
        return flightRepository.count();
    }

    private Flight createFlight(String name, String from, String to, String dep, String arr, double price,
                                int totalSeats, int first, int bus, int prem, int eco) {
        Flight f = new Flight();
        f.setFlightName(name);
        f.setFrom(from);
        f.setTo(to);
        f.setDepartureTime(dep);
        f.setArrivalTime(arr);
        f.setPrice(price);
        f.setAvailableSeats(totalSeats);
        f.setFirstClassSeats(first);
        f.setBusinessSeats(bus);
        f.setPremiumEconomySeats(prem);
        f.setEconomySeats(eco);
        return f;
    }

    private long seedHotels(boolean force) {
        if (!force && hotelRepository.count() >= 50) {
            return hotelRepository.count();
        }

        List<Hotel> list = new ArrayList<>();
        list.add(createHotel("The Taj Mahal Palace", "Mumbai", 22500, 45, "WiFi, Sea View, Heritage Architecture, Luxury Spa, Swimming Pool, Multi-Cuisine Fine Dining, Valet Parking, Airport Shuttle"));
        list.add(createHotel("The Oberoi Mumbai", "Mumbai", 21000, 38, "Ocean View, Luxury Spa, 24-hr Butler, Heated Pool, Fine Dining, Fitness Center, Business Lounge"));
        list.add(createHotel("Trident Nariman Point", "Mumbai", 13500, 60, "Marine Drive View, Swimming Pool, Spa, Bar, Conference Rooms, Fitness Center"));
        list.add(createHotel("JW Marriott Mumbai Juhu", "Mumbai", 17500, 50, "Beachfront, Infinity Pool, Salt Water Pool, Award-Winning Spa, 6 Restaurants, Kids Club"));
        list.add(createHotel("Grand Hyatt Mumbai Hotel & Residences", "Mumbai", 12000, 75, "Multi-Level Pool, Tennis Court, Luxury Spa, Shopping Plaza, Pet Friendly, Free WiFi"));
        list.add(createHotel("ITC Grand Central", "Mumbai", 11000, 55, "Heritage Decor, Rooftop Bar, Indoor Pool, Kaya Kalp Spa, Business Center"));
        list.add(createHotel("The Leela Palace New Delhi", "Delhi", 24000, 40, "Rooftop Infinity Pool, ESPA Luxury Spa, Michelin Star Dining, Butler Service, City View"));
        list.add(createHotel("ITC Maurya", "Delhi", 16500, 65, "Bukhara Iconic Dining, Royal Spa, Olympic Size Pool, Green Luxury Certified, Valet"));
        list.add(createHotel("Taj Palace New Delhi", "Delhi", 15000, 70, "6 Acres Parkland, Blue Ginger Dining, Large Pool, Jiva Spa, Airport Shuttle"));
        list.add(createHotel("The Imperial New Delhi", "Delhi", 19500, 35, "Victorian Architecture, Museum Art Collection, Luxury Spa, French Bakery, Gardens"));
        list.add(createHotel("Radisson Blu Plaza Delhi Airport", "Delhi", 8500, 80, "Near Airport, Lagoon Pool, 5 Dining Outlets, Free Airport Shuttle, R-The Spa"));
        list.add(createHotel("Roseate House New Delhi", "Delhi", 11500, 45, "Rooftop Heated Pool, 4K Cinema, Spa, Modern Minimalist Design, Bar"));
        list.add(createHotel("The Leela Palace Bengaluru", "Bengaluru", 19000, 50, "Palace Architecture, 7 Acres Gardens, Royal Suites, Lagoon Pool, ESPA Spa"));
        list.add(createHotel("The Ritz-Carlton Bangalore", "Bengaluru", 18000, 42, "Rooftop Bar BANG, Ritz Spa, Lantern Dining, 24-hr Gym, Luxury Chauffeur"));
        list.add(createHotel("Taj West End", "Bengaluru", 15500, 36, "20-acre Heritage Garden, Tennis Courts, Machan Restaurant, Jiva Spa, Historic Stays"));
        list.add(createHotel("ITC Gardenia", "Bengaluru", 14000, 60, "Wind Pavilion, Heated Pool, Kaya Kalp Spa, Eco-Luxury Certified, Japanese Dining Edo"));
        list.add(createHotel("Shangri-La Bengaluru", "Bengaluru", 12500, 70, "Panoramic Skyline View, Horizon Club, Health Club, CHI Spa, Multi-Cuisine"));
        list.add(createHotel("Taj Exotica Resort & Spa", "Goa", 26000, 40, "Private Benaulim Beach Access, Jiva Spa, 9-Hole Golf, Mediterranean Villa, Huge Pool"));
        list.add(createHotel("W Goa", "Goa", 24500, 35, "Vagator Beachfront, Rock Pool Sunset Parties, AWAY Spa, Woobar, Modern Glamour"));
        list.add(createHotel("Alila Diwa Goa", "Goa", 16500, 48, "Paddy Field Infinity Pool, Open Air Bath, Spa Alila, Kids Zone, Shuttle to Gonsua Beach"));
        list.add(createHotel("Grand Hyatt Goa", "Goa", 18500, 65, "Bambolim Bay Waterfront, 28-Acre Estate, Indoor & Outdoor Pools, Shamana Spa"));
        list.add(createHotel("Caravela Beach Resort", "Goa", 13000, 55, "Varca White Sand Beach, Golf Course, Swim-up Bar, Water Sports, Sea View"));
        list.add(createHotel("ITC Grand Goa Resort & Spa", "Goa", 19500, 50, "Arossim Beach Access, Multi-Level Lagoons, Ayurvedic Spa, Village Style Architecture"));
        list.add(createHotel("Rambagh Palace", "Jaipur", 45000, 25, "Former Royal Residence, Mughal Gardens, Peacocks, Royal Dining Suvarna Mahal, Jiva Spa"));
        list.add(createHotel("ITC Rajputana", "Jaipur", 12000, 60, "Traditional Haveli Design, Courtyard Pool, Royal Rajasthani Thali, Spa, Bar"));
        list.add(createHotel("Jai Mahal Palace", "Jaipur", 22000, 30, "18-Acre Indo-Saracenic Gardens, Life-size Chessboard, Marble Pool, Heritage Suites"));
        list.add(createHotel("Fairmont Jaipur", "Jaipur", 17000, 55, "Aravalli Hills View, Rooftop Royal Lounge, Rajasthani Folk Evenings, Grand Ballrooms"));
        list.add(createHotel("The Oberoi Rajvilas", "Jaipur", 48000, 20, "Luxury Tents & Villas, 280-year-old Shiva Temple, Private Pools, Royal Ayurvedic Spa"));
        list.add(createHotel("The Oberoi Udaivilas", "Udaipur", 55000, 22, "Lake Pichola Shore, Semi-private Moat Pools, Mewari Architecture, Boat Transfer"));
        list.add(createHotel("Taj Lake Palace", "Udaipur", 52000, 24, "Floating White Marble Palace on Lake, Royal Butlers, Vintage Car Rides, Jiva Spa"));
        list.add(createHotel("The Leela Palace Udaipur", "Udaipur", 49000, 25, "Lake Pichola Waterfront, Guava Garden Spa, Private Jetty, Sheesh Mahal Dining"));
        list.add(createHotel("Trident Udaipur", "Udaipur", 14500, 50, "43-acre Landscaped Gardens, Kids Club, Pool, Boat Rides, Mewar Cuisine"));
        list.add(createHotel("The Himalayan", "Manali", 11500, 28, "Victorian Gothic Castle, Orchard Views, Heated Pool, Fireplace in Rooms, Bar"));
        list.add(createHotel("Span Resort & Spa", "Manali", 14000, 32, "Beas Riverside, Helipad, Luxury Chalets, Trout Fishing, Mountain Spa, Pine Forest"));
        list.add(createHotel("Apple Country Resort", "Manali", 6500, 40, "Panoramic Valley Views, Apple Orchards, Cedar Forest Walks, Spa, Pure Veg Dining"));
        list.add(createHotel("Manuallaya The Resort Spa", "Manali", 8500, 45, "All-Weather Heated Indoor Pool, Solarium, Himalayan View, Health Club, Bar"));
        list.add(createHotel("Wildflower Hall Oberoi", "Shimla", 35000, 25, "8250 ft Elevation, Heated Outdoor Whirlpool, Pine Forest Sanctuary, Cedar Spa"));
        list.add(createHotel("The Oberoi Cecil", "Shimla", 21000, 30, "Colonial Grandeur, Indoor Heated Pool, Classical Music, Valley Facing Tea Lounge"));
        list.add(createHotel("Radisson Hotel Shimla", "Shimla", 9500, 45, "At the foot of NW Himalayas, Cedar Garden, Games Room, Multi-Cuisine, Spa"));
        list.add(createHotel("Grand Hyatt Kochi Bolgatty", "Kochi", 14500, 60, "Vembanad Lakefront, Waterfront Marina, Santata Spa, Infinity Pool, Rooftop Dining"));
        list.add(createHotel("Brunton Boatyard", "Kochi", 16000, 26, "Historic Fort Kochi Harbour, Restored Victorian Shipyard, Seafood Dining, Pool"));
        list.add(createHotel("Kumarakom Lake Resort", "Kerala", 24000, 30, "Backwater Canals, Meandering Pool Villas, Houseboat Cruises, Ayurmana Ayurvedic Spa"));
        list.add(createHotel("Fragrant Nature Munnar", "Munnar", 9800, 35, "Misty Tea Hill Views, Fireplace in All Rooms, Glass Roof Spa, Rooftop Dining"));
        list.add(createHotel("The Oberoi Amarvilas", "Agra", 42000, 30, "Unobstructed Views of Taj Mahal from All Rooms, Moorish Pools, Royal Spa, Balconies"));
        list.add(createHotel("ITC Mughal", "Agra", 10500, 65, "35 Acres Mughal Gardens, Kaya Kalp 99000 sq ft Spa, Near Taj Mahal, 2 Pools"));
        list.add(createHotel("Courtyard by Marriott Agra", "Agra", 6200, 75, "Fatehabad Road, Outdoor Pool, MoMo Cafe, Fitness Center, Family Friendly"));
        list.add(createHotel("BrijRama Palace Heritage Hotel", "Varanasi", 26000, 22, "Darbhanga Ghat Private Access, River Ganges Balcony, Classical Live Sitar, Boat"));
        list.add(createHotel("Taj Ganges Varanasi", "Varanasi", 13500, 50, "40 Acres Lush Greens, Nadesar Palace Compound, Jiva Spa, Vegetarian Specialities"));
        list.add(createHotel("ITC Royal Bengal", "Kolkata", 13500, 80, "Iconic Skyscraper, 6 Signature Restaurants, Royal Spa, City Views, Luxury Lounge"));
        list.add(createHotel("The Oberoi Grand Kolkata", "Kolkata", 14000, 55, "Grand Dame of Chowringhee, Colonial Columns, Palm Tree Courtyard Pool, Spa"));
        list.add(createHotel("ITC Grand Chola", "Chennai", 14500, 90, "Chola Dynasty Architecture, 10 World-Class Dining Venues, 3 Pools, Luxury Spa"));
        list.add(createHotel("The Leela Palace Chennai", "Chennai", 16500, 50, "Chettinad Inspired Palace, Sea Facing, ESPA Spa, Jamavar Royal Dining, Pool"));
        list.add(createHotel("Taj Falaknuma Palace", "Hyderabad", 48000, 20, "Mirror of the Sky Palace, Nizam's 101-Seat Dining Table, Horse Carriage Arrival"));
        list.add(createHotel("ITC Kohenur", "Hyderabad", 15000, 60, "HITEC City Lakefront, Diamond Facade, Italian Restaurant Ottimo, Rooftop Skypoint"));
        list.add(createHotel("Marina Bay Sands", "Singapore", 46000, 40, "Iconic Rooftop Infinity Pool, SkyPark Observation Deck, 20+ Celebrity Restaurants, Casino"));
        list.add(createHotel("Atlantis The Palm", "Dubai", 42000, 35, "Palm Island Private Beach, Aquaventure Waterpark Access, The Lost Chambers Aquarium"));
        list.add(createHotel("AYANA Resort and Spa", "Bali", 28000, 30, "Jimbaran Cliffside, Rock Bar Sunset, 12 Swimming Pools, Private Beach, Thalasso Spa"));

        hotelRepository.saveAll(list);
        log.info("Seeded {} hotels into database.", list.size());
        return hotelRepository.count();
    }

    private Hotel createHotel(String name, String location, double price, int rooms, String amenities) {
        Hotel h = new Hotel();
        h.sethotelName(name);
        h.setLocation(location);
        h.setPricePerNight(price);
        h.setAvailableRooms(rooms);
        h.setamenities(amenities);
        return h;
    }

    private long seedHomestays(boolean force) {
        if (!force && homestayRepository.count() >= 20) {
            return homestayRepository.count();
        }

        List<Homestay> list = new ArrayList<>();
        list.add(createHomestay("Whispering Pines Wooden Chalet", "Manali", 3800, 6, "Himalayan Forest View, Wooden Architecture, Bonfire, Kitchenette, Free WiFi, Hot Water, Garden", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Apple Blossom Heritage Homestay", "Manali", 3200, 5, "Apple Orchard Stay, Home-cooked Himachali Food, Mountain Balcony, Fireplace, Trekking Guide", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Snow Peak Mountain Abode", "Manali", 4200, 4, "Rohtang Pass Valley Views, Attic Glass Room, Heated Blankets, Barbecue, Pet Friendly", "01:00 PM", "11:00 AM"));
        list.add(createHomestay("Estate View Coffee Plantation Stay", "Coorg", 4500, 8, "20-acre Private Coffee Estate, Bird Watching, Kodava Homemade Meals, Stream Walk, Bonfire", "01:00 PM", "11:00 AM"));
        list.add(createHomestay("Misty Hills Kodagu Homestay", "Coorg", 3600, 6, "Brahmagiri Hills View, Traditional Coorg Architecture, Filter Coffee Bar, Plantation Tour", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Woodside Organic Farmstay", "Coorg", 3900, 5, "Organic Spices Farm, Riverside Hammocks, Campfire, Free Parking, Pets Allowed", "12:00 PM", "10:30 AM"));
        list.add(createHomestay("Rainforest Treehouse & Villa", "Wayanad", 5200, 4, "Canopy Treehouse, Natural Spring Stream, Kerala Sadya Meals, Bamboo Cottages, Bird Watching", "02:00 PM", "11:00 AM"));
        list.add(createHomestay("Edakkal Heritage Stay", "Wayanad", 3400, 6, "Historic Cave Trek Base, Organic Vegetable Garden, Open Patio, Traditional Kerala Breakfast", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Green Valley Eco Retreat", "Wayanad", 2900, 5, "Tea Garden Surrounding, Mountain Mist, Yoga Deck, Fresh Milk & Organic Tea Provided", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Nilgiri Colonial Heritage Villa", "Ooty", 4800, 5, "British Colonial Fireplace, Tea Garden Panorama, Lawn Tennis, Butler Service, Rose Garden", "01:00 PM", "11:00 AM"));
        list.add(createHomestay("Tea Garden Bungalow Stay", "Ooty", 4100, 6, "Live amidst working tea leaves, Fresh Tea Tasting, Vintage Furnishings, Library", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Rosewood Country Cottage", "Ooty", 3500, 4, "Dodabetta Peak Views, Wooden Deck, Campfire Grill, Board Games, Peaceful Neighbourhood", "12:00 PM", "10:30 AM"));
        list.add(createHomestay("Portuguese Heritage Villa Candolim", "Goa", 5800, 6, "300-year-old Restored Indo-Portuguese Villa, Private Courtyard Pool, Walk to Beach, Kitchen", "02:00 PM", "11:00 AM"));
        list.add(createHomestay("Palm Breeze Boutique Stay Siolim", "Goa", 4200, 5, "Chapora River Breeze, Tropical Palms Garden, Bike Rentals, High-Speed WiFi, Outdoor Lounge", "01:00 PM", "11:00 AM"));
        list.add(createHomestay("Casa Serenity Anjuna", "Goa", 3900, 7, "Anjuna Flea Market Proximity, Rooftop Chill-out Terrace, Kitchen Access, Bohemian Decor", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Riverview Haven Aldona", "Goa", 4600, 4, "Backwaters Kayaking, Quiet Serene Village, Traditional Goan Fish Curry, Sunset Balcony", "01:00 PM", "11:00 AM"));
        list.add(createHomestay("Arabica Coffee Estate Haven", "Chikmagalur", 4400, 6, "Mullayanagiri Foothills, Arabica Plantation Walk, Malnad Style Thali, Waterfall Nearby", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Cloud 9 Mist Homestay", "Chikmagalur", 3800, 5, "Valley Clouds Rolling In, Star Gazing Deck, Outdoor Badminton, Coffee Making Workshop", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Western Ghats Nature Villa", "Chikmagalur", 3200, 6, "Deep Forest Border, Trekking Trail Starting Point, Riverside Campfire, Home Cooked Food", "12:00 PM", "10:30 AM"));
        list.add(createHomestay("Ganges Riverside Meditation Abode", "Rishikesh", 3600, 8, "Private Steps to Sacred Ganga, Yoga & Meditation Hall, Organic Satvik Food, Sound of Water", "12:00 PM", "10:00 AM"));
        list.add(createHomestay("Himalayan Bliss Retreat", "Rishikesh", 4100, 5, "Tapovan Hills View, Ganga Aarti Proximity, Ayurvedic Herbal Tea, Terrace Sun Loungers", "01:00 PM", "11:00 AM"));
        list.add(createHomestay("Kanchanjunga View Tea Chalet", "Darjeeling", 4300, 5, "Unobstructed Views of Mt. Kanchenjunga, Organic Darjeeling First Flush, Wooden Heaters", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Pine Ridge Heritage Homestay", "Darjeeling", 3100, 6, "Near Mall Road & Toy Train, British Era Wooden Interiors, Momos & Thukpa Kitchen", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Cardamom Scented Valley Cottage", "Munnar", 3700, 6, "Spice Garden Trail, Anamudi Peak Views, Kerala Spice Infused Teas, Campfire Nights", "12:00 PM", "11:00 AM"));
        list.add(createHomestay("Cloud End Forest Bungalow", "Mussoorie", 4900, 4, "Historic Benog Wildlife Sanctuary Edge, Deodar Forest Trails, Quiet Sunset Viewpoints", "01:00 PM", "11:00 AM"));
        list.add(createHomestay("Parvati Riverbank Wooden Lodge", "Kasol", 2800, 7, "Babbling Parvati River, Snow Peaks View, Israeli & Local Himachali Cafe, Bonfire", "12:00 PM", "11:00 AM"));

        homestayRepository.saveAll(list);
        log.info("Seeded {} homestays into database.", list.size());
        return homestayRepository.count();
    }

    private Homestay createHomestay(String name, String loc, double price, int rooms, String am, String inTime, String outTime) {
        Homestay h = new Homestay();
        h.sethomestayName(name);
        h.setLocation(loc);
        h.setPricePerNight(price);
        h.setAvailableRooms(rooms);
        h.setamenities(am);
        h.setCheckInTime(inTime);
        h.setCheckOutTime(outTime);
        return h;
    }

    private long seedTrains(boolean force) {
        if (!force && trainRepository.count() >= 30) {
            return trainRepository.count();
        }

        List<Train> list = new ArrayList<>();
        list.add(createTrain("Vande Bharat Express (22436)", "Delhi", "Varanasi", "06:00", "14:00", 1850, 240));
        list.add(createTrain("Vande Bharat Express (20901)", "Mumbai", "Gandhinagar", "06:10", "12:25", 1420, 260));
        list.add(createTrain("Vande Bharat Express (22457)", "Delhi", "Dehradun", "07:00", "11:45", 1060, 220));
        list.add(createTrain("Vande Bharat Express (20607)", "Chennai", "Mysuru", "05:50", "12:20", 1365, 230));
        list.add(createTrain("Vande Bharat Express (20661)", "Bengaluru", "Dharwad", "05:45", "12:10", 1285, 240));
        list.add(createTrain("Vande Bharat Express (20172)", "Delhi", "Bhopal", "14:40", "22:10", 1665, 250));
        list.add(createTrain("Vande Bharat Express (22348)", "Patna", "Howrah", "08:00", "14:35", 1505, 240));
        list.add(createTrain("Vande Bharat Express (20631)", "Kasaragod", "Thiruvananthapuram", "07:00", "15:05", 1555, 230));
        list.add(createTrain("Vande Bharat Express (22895)", "Howrah", "Puri", "06:10", "12:35", 1265, 250));
        list.add(createTrain("Vande Bharat Express (22487)", "Delhi", "Amritsar", "15:15", "20:45", 1375, 240));
        list.add(createTrain("Mumbai Rajdhani (12952)", "Delhi", "Mumbai", "16:55", "08:35", 2980, 180));
        list.add(createTrain("August Kranti Rajdhani (12954)", "Delhi", "Mumbai", "17:15", "10:05", 2750, 190));
        list.add(createTrain("Howrah Rajdhani (12301)", "Kolkata", "Delhi", "16:50", "10:05", 3050, 170));
        list.add(createTrain("Bengaluru Rajdhani (22692)", "Delhi", "Bengaluru", "19:50", "05:20", 3620, 160));
        list.add(createTrain("Chennai Rajdhani (12434)", "Delhi", "Chennai", "15:35", "20:45", 3450, 160));
        list.add(createTrain("Jammu Tawi Rajdhani (12425)", "Delhi", "Jammu", "20:40", "05:00", 1980, 190));
        list.add(createTrain("Dibrugarh Rajdhani (12424)", "Delhi", "Guwahati", "16:20", "19:35", 3750, 150));
        list.add(createTrain("Bhopal Shatabdi Express (12002)", "Delhi", "Agra", "06:00", "07:50", 680, 280));
        list.add(createTrain("Amritsar Shatabdi (12013)", "Delhi", "Amritsar", "16:30", "22:30", 1120, 260));
        list.add(createTrain("Kalka Shatabdi (12005)", "Delhi", "Chandigarh", "17:15", "20:40", 790, 280));
        list.add(createTrain("Lucknow Shatabdi (12004)", "Delhi", "Lucknow", "06:10", "12:40", 1165, 260));
        list.add(createTrain("Chennai-Bengaluru Shatabdi (12027)", "Chennai", "Bengaluru", "17:30", "22:25", 985, 260));
        list.add(createTrain("Pune-Secunderabad Shatabdi (12025)", "Pune", "Hyderabad", "06:00", "14:20", 1420, 240));
        list.add(createTrain("Howrah-Ranchi Shatabdi (12019)", "Kolkata", "Ranchi", "06:05", "13:15", 1090, 250));
        list.add(createTrain("Mumbai-Delhi Duronto (22209)", "Mumbai", "Delhi", "23:00", "15:55", 2850, 170));
        list.add(createTrain("Howrah-Yesvantpur Duronto (12245)", "Kolkata", "Bengaluru", "10:50", "16:00", 3350, 160));
        list.add(createTrain("Pune-Howrah Duronto (12221)", "Pune", "Kolkata", "15:15", "20:15", 3150, 160));
        list.add(createTrain("Sealdah-Delhi Duronto (12259)", "Kolkata", "Delhi", "18:30", "11:15", 2950, 170));
        list.add(createTrain("Lucknow-Delhi Tejas Express (82502)", "Lucknow", "Delhi", "15:35", "22:05", 1550, 250));
        list.add(createTrain("Mumbai-Ahmedabad Tejas Express (82902)", "Mumbai", "Ahmedabad", "15:45", "22:05", 1480, 250));
        list.add(createTrain("Goa Express (12780)", "Delhi", "Goa", "15:15", "05:40", 2450, 190));
        list.add(createTrain("Deccan Queen (12124)", "Pune", "Mumbai", "07:15", "10:25", 420, 310));
        list.add(createTrain("Kerala Express (12625)", "Delhi", "Kochi", "20:10", "18:15", 2750, 180));
        list.add(createTrain("Paschim Express (12926)", "Amritsar", "Mumbai", "07:35", "14:55", 2150, 210));
        list.add(createTrain("Grand Trunk Express (12615)", "Chennai", "Delhi", "18:50", "06:30", 2580, 190));
        list.add(createTrain("Netaji Express (12311)", "Kolkata", "Delhi", "21:55", "20:55", 2280, 200));

        trainRepository.saveAll(list);
        log.info("Seeded {} trains into database.", list.size());
        return trainRepository.count();
    }

    private Train createTrain(String name, String from, String to, String dep, String arr, double price, int seats) {
        Train t = new Train();
        t.setTrainName(name);
        t.setFrom(from);
        t.setTo(to);
        t.setDepartureTime(dep);
        t.setArrivalTime(arr);
        t.setPrice(price);
        t.setAvailableSeats(seats);
        return t;
    }

    private long seedBuses(boolean force) {
        if (!force && busRepository.count() >= 30) {
            return busRepository.count();
        }

        List<Bus> list = new ArrayList<>();
        list.add(createBus("Zingbus Electric AC Sleeper", "Delhi", "Manali", "20:30", "08:30", 1350, 36));
        list.add(createBus("IntrCity SmartBus Multi-Axle", "Delhi", "Manali", "21:00", "09:00", 1450, 40));
        list.add(createBus("NueGo Ultra Electric AC", "Delhi", "Chandigarh", "07:00", "11:30", 550, 44));
        list.add(createBus("Zingbus Premium AC Lounge", "Delhi", "Jaipur", "08:00", "13:00", 620, 40));
        list.add(createBus("IntrCity SmartBus AC Sleeper", "Delhi", "Amritsar", "21:45", "06:30", 950, 38));
        list.add(createBus("SRS Travels Multi-Axle Volvo", "Bengaluru", "Goa", "20:00", "08:30", 1400, 42));
        list.add(createBus("VRL Travels I-Shift AC Sleeper", "Bengaluru", "Goa", "21:15", "09:00", 1550, 36));
        list.add(createBus("KSRTC Airavat Club Class 2.0", "Bengaluru", "Hyderabad", "22:00", "06:30", 1150, 45));
        list.add(createBus("Orange Tours & Travels Volvo Multi-Axle", "Bengaluru", "Hyderabad", "22:30", "07:00", 1250, 40));
        list.add(createBus("KSRTC Airavat Diamond Class", "Bengaluru", "Chennai", "06:00", "11:30", 680, 46));
        list.add(createBus("SRS Travels AC Semi-Sleeper", "Bengaluru", "Coorg", "23:00", "05:30", 750, 40));
        list.add(createBus("Greenline Travels Multi-Axle", "Bengaluru", "Ooty", "22:30", "06:30", 980, 38));
        list.add(createBus("Neeta Tours & Travels Volvo AC", "Mumbai", "Pune", "07:00", "10:30", 450, 45));
        list.add(createBus("Zingbus Express AC", "Mumbai", "Pune", "14:00", "17:30", 420, 42));
        list.add(createBus("VRL Travels Multi-Axle AC Sleeper", "Mumbai", "Goa", "18:30", "07:30", 1650, 36));
        list.add(createBus("IntrCity SmartBus Premium Sleeper", "Mumbai", "Goa", "19:30", "08:00", 1750, 38));
        list.add(createBus("Gujarat Travels AC Sleeper", "Mumbai", "Ahmedabad", "21:00", "06:30", 1100, 36));
        list.add(createBus("Neeta Travels Luxury AC Sleeper", "Mumbai", "Mahabaleshwar", "06:30", "13:00", 850, 38));
        list.add(createBus("Purple Travels Volvo AC", "Mumbai", "Shirdi", "22:00", "05:30", 750, 42));
        list.add(createBus("NueGo Electric AC Coach", "Hyderabad", "Vijayawada", "06:30", "11:45", 620, 44));
        list.add(createBus("Orange Tours & Travels Sleeper", "Hyderabad", "Visakhapatnam", "20:00", "07:30", 1450, 36));
        list.add(createBus("Parveen Travels Volvo AC", "Chennai", "Coimbatore", "21:30", "06:00", 950, 42));
        list.add(createBus("KPN Travels Multi-Axle Sleeper", "Chennai", "Madurai", "22:00", "06:30", 890, 38));
        list.add(createBus("Seabird Tourist AC Sleeper", "Pune", "Goa", "20:30", "06:30", 1350, 36));
        list.add(createBus("Prasanna Purple Volvo AC", "Pune", "Mumbai", "08:00", "11:30", 450, 45));
        list.add(createBus("Hans Travels BharatBenz AC Sleeper", "Jaipur", "Delhi", "15:00", "20:00", 580, 40));
        list.add(createBus("Zingbus Premium AC", "Chandigarh", "Manali", "11:00", "18:30", 950, 40));
        list.add(createBus("Royal Cruiser Volvo Multi-Axle", "Kolkata", "Siliguri", "19:30", "08:00", 1400, 42));
        list.add(createBus("Shyamoli Paribahan AC Sleeper", "Kolkata", "Digha", "06:30", "10:30", 420, 44));
        list.add(createBus("Zingbus AC Sleeper", "Delhi", "Shimla", "22:00", "06:00", 880, 38));
        list.add(createBus("IntrCity SmartBus AC", "Delhi", "Dehradun", "23:30", "05:30", 720, 40));
        list.add(createBus("SRS Travels AC Sleeper", "Goa", "Mumbai", "18:00", "07:00", 1600, 36));
        list.add(createBus("KSRTC Airavat AC", "Chennai", "Bengaluru", "15:00", "20:30", 700, 45));
        list.add(createBus("Orange Travels AC Sleeper", "Goa", "Bengaluru", "19:00", "07:30", 1450, 38));
        list.add(createBus("IntrCity SmartBus AC", "Delhi", "Lucknow", "21:30", "06:00", 920, 40));
        list.add(createBus("Zingbus AC Sleeper", "Manali", "Delhi", "18:00", "06:00", 1400, 36));

        busRepository.saveAll(list);
        log.info("Seeded {} buses into database.", list.size());
        return busRepository.count();
    }

    private Bus createBus(String name, String from, String to, String dep, String arr, double price, int seats) {
        Bus b = new Bus();
        b.setBusName(name);
        b.setFrom(from);
        b.setTo(to);
        b.setDepartureTime(dep);
        b.setArrivalTime(arr);
        b.setPrice(price);
        b.setAvailableSeats(seats);
        return b;
    }

    private long seedCabs(boolean force) {
        if (!force && cabRepository.count() >= 40) {
            return cabRepository.count();
        }

        List<Cab> list = new ArrayList<>();
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Delhi", "Agra", "06:00", "09:30", 2600, 4, 230.0, "3h 30m"));
        list.add(createCab("SUV (Innova Crysta)", "Delhi", "Agra", "07:00", "10:30", 3800, 6, 230.0, "3h 30m"));
        list.add(createCab("Luxury SUV (Toyota Fortuner)", "Delhi", "Agra", "08:00", "11:30", 6500, 6, 230.0, "3h 30m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Delhi", "Jaipur", "06:30", "11:30", 3400, 4, 280.0, "5h 00m"));
        list.add(createCab("SUV (Innova Crysta)", "Delhi", "Jaipur", "07:30", "12:30", 4900, 6, 280.0, "5h 00m"));
        list.add(createCab("Executive Tempo Traveller (12-Seater)", "Delhi", "Jaipur", "06:00", "11:30", 8500, 12, 280.0, "5h 30m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Delhi", "Chandigarh", "06:00", "10:30", 3100, 4, 250.0, "4h 30m"));
        list.add(createCab("SUV (Innova Crysta)", "Delhi", "Chandigarh", "08:00", "12:30", 4500, 6, 250.0, "4h 30m"));
        list.add(createCab("Prime Sedan (Honda City)", "Delhi", "Dehradun", "05:30", "10:30", 3600, 4, 260.0, "5h 00m"));
        list.add(createCab("SUV (Innova Crysta)", "Delhi", "Rishikesh", "06:00", "11:30", 4400, 6, 250.0, "5h 30m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Delhi", "Haridwar", "05:00", "09:30", 3200, 4, 220.0, "4h 30m"));
        list.add(createCab("SUV (Innova Crysta)", "Delhi", "Shimla", "05:00", "12:30", 6800, 6, 350.0, "7h 30m"));
        list.add(createCab("Executive Tempo Traveller (12-Seater)", "Delhi", "Manali", "05:00", "18:00", 16500, 12, 540.0, "13h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Mumbai", "Pune", "06:00", "09:00", 2400, 4, 150.0, "3h 00m"));
        list.add(createCab("SUV (Innova Crysta)", "Mumbai", "Pune", "08:00", "11:00", 3600, 6, 150.0, "3h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Mumbai", "Lonavala", "07:00", "09:00", 1950, 4, 85.0, "2h 00m"));
        list.add(createCab("SUV (Innova Crysta)", "Mumbai", "Mahabaleshwar", "06:00", "12:00", 5200, 6, 260.0, "6h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Mumbai", "Alibaug", "07:30", "10:30", 2800, 4, 100.0, "3h 00m"));
        list.add(createCab("SUV (Innova Crysta)", "Mumbai", "Nashik", "06:30", "10:30", 4200, 6, 170.0, "4h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Mumbai", "Shirdi", "06:00", "11:30", 4600, 4, 245.0, "5h 30m"));
        list.add(createCab("Luxury SUV (Toyota Fortuner)", "Mumbai", "Goa", "05:00", "16:00", 17500, 6, 590.0, "11h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Bengaluru", "Mysuru", "06:30", "09:30", 2800, 4, 145.0, "3h 00m"));
        list.add(createCab("SUV (Innova Crysta)", "Bengaluru", "Mysuru", "07:30", "10:30", 4100, 6, 145.0, "3h 00m"));
        list.add(createCab("SUV (Innova Crysta)", "Bengaluru", "Coorg", "06:00", "11:30", 5500, 6, 265.0, "5h 30m"));
        list.add(createCab("Prime Sedan (Honda City)", "Bengaluru", "Ooty", "05:30", "12:00", 6200, 4, 280.0, "6h 30m"));
        list.add(createCab("SUV (Innova Crysta)", "Bengaluru", "Chikmagalur", "06:30", "11:00", 5100, 6, 245.0, "4h 30m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Bengaluru", "Pondicherry", "06:00", "12:30", 5400, 4, 320.0, "6h 30m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Bengaluru", "Chennai", "06:00", "12:00", 5600, 4, 350.0, "6h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Chennai", "Pondicherry", "07:00", "09:45", 2700, 4, 155.0, "2h 45m"));
        list.add(createCab("SUV (Innova Crysta)", "Chennai", "Pondicherry", "08:30", "11:15", 3900, 6, 155.0, "2h 45m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Chennai", "Mahabalipuram", "08:00", "09:30", 1600, 4, 60.0, "1h 30m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Chennai", "Tirupati", "05:30", "09:00", 3100, 4, 135.0, "3h 30m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Kolkata", "Digha", "06:00", "10:00", 3300, 4, 185.0, "4h 00m"));
        list.add(createCab("SUV (Innova Crysta)", "Kolkata", "Mandarmani", "06:30", "10:30", 4600, 6, 180.0, "4h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Kolkata", "Shantiniketan", "07:00", "11:00", 3500, 4, 165.0, "4h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Hyderabad", "Warangal", "07:00", "10:00", 3200, 4, 150.0, "3h 00m"));
        list.add(createCab("SUV (Innova Crysta)", "Hyderabad", "Nagarjuna Sagar", "07:30", "11:00", 4100, 6, 165.0, "3h 30m"));
        list.add(createCab("SUV (Innova Crysta)", "Hyderabad", "Srisailam", "06:00", "11:00", 5200, 6, 215.0, "5h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Pune", "Mahabaleshwar", "07:00", "10:00", 2700, 4, 120.0, "3h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Pune", "Lonavala", "08:00", "09:30", 1700, 4, 65.0, "1h 30m"));
        list.add(createCab("SUV (Innova Crysta)", "Pune", "Shirdi", "06:00", "11:00", 4600, 6, 205.0, "5h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Jaipur", "Udaipur", "06:00", "12:30", 5800, 4, 395.0, "6h 30m"));
        list.add(createCab("SUV (Innova Crysta)", "Jaipur", "Pushkar", "07:30", "10:30", 3500, 6, 145.0, "3h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Chandigarh", "Shimla", "07:00", "10:30", 2600, 4, 115.0, "3h 30m"));
        list.add(createCab("SUV (Innova Crysta)", "Chandigarh", "Manali", "06:00", "14:00", 6900, 6, 305.0, "8h 00m"));
        list.add(createCab("Prime Sedan (Dzire / Etios)", "Goa", "Gokarna", "08:00", "11:30", 3600, 4, 150.0, "3h 30m"));

        cabRepository.saveAll(list);
        log.info("Seeded {} cabs into database.", list.size());
        return cabRepository.count();
    }

    private Cab createCab(String type, String from, String to, String dep, String arr, double price, int seats, double dist, String dur) {
        Cab c = new Cab();
        c.setCabType(type);
        c.setFrom(from);
        c.setTo(to);
        c.setDepartureTime(dep);
        c.setArrivalTime(arr);
        c.setPrice(price);
        c.setAvailableSeats(seats);
        c.setDistanceKm(dist);
        c.setEstimatedDuration(dur);
        return c;
    }

    private long seedDemoBookings() {
        List<Users> users = userRepository.findAll();
        Users targetUser = null;

        if (users.isEmpty()) {
            Users demoUser = new Users();
            demoUser.setEmail("demo@makemytrip.com");
            demoUser.setFirstName("Rahul");
            demoUser.setLastName("Sharma");
            demoUser.setPhoneNumber("9876543210");
            demoUser.setPassword(passwordEncoder.encode("Demo@123"));
            demoUser.setRole("USER");
            demoUser.setLoyaltyPoints(3500);
            demoUser.setLoyaltyEarned(5000);
            targetUser = userRepository.save(demoUser);
            log.info("Created demo user: {}", demoUser.getEmail());
        } else {
            targetUser = users.get(0);
        }

        if (targetUser.getBookings() == null) {
            targetUser.setBookings(new ArrayList<>());
        }

        // Check if user already has demo bookings
        boolean hasFlight = targetUser.getBookings().stream().anyMatch(b -> "Flight".equalsIgnoreCase(b.getType()));
        boolean hasHotel = targetUser.getBookings().stream().anyMatch(b -> "Hotel".equalsIgnoreCase(b.getType()));
        boolean hasHomestay = targetUser.getBookings().stream().anyMatch(b -> "Homestay".equalsIgnoreCase(b.getType()));
        boolean hasTrain = targetUser.getBookings().stream().anyMatch(b -> "Train".equalsIgnoreCase(b.getType()));
        boolean hasBus = targetUser.getBookings().stream().anyMatch(b -> "Bus".equalsIgnoreCase(b.getType()));
        boolean hasCab = targetUser.getBookings().stream().anyMatch(b -> "Cab".equalsIgnoreCase(b.getType()));
        boolean hasHoliday = targetUser.getBookings().stream().anyMatch(b -> "Holiday".equalsIgnoreCase(b.getType()));

        List<Flight> flights = flightRepository.findAll();
        List<Hotel> hotels = hotelRepository.findAll();
        List<Homestay> homestays = homestayRepository.findAll();
        List<Train> trains = trainRepository.findAll();
        List<Bus> buses = busRepository.findAll();
        List<Cab> cabs = cabRepository.findAll();

        if (!hasFlight && !flights.isEmpty()) {
            Flight f = flights.get(0);
            Users.Booking b = new Users.Booking();
            b.setType("Flight");
            b.setBookingId(f.getId() != null ? f.getId() : "FLIGHT-DEMO-01");
            b.setDate(Instant.now().minusSeconds(86400 * 2).toString());
            b.setQuantity(2);
            b.setTotalPrice(f.getPrice() * 2);
            b.setTravelClass("Economy");
            b.setSeatNumbers(List.of("12A", "12B"));
            targetUser.getBookings().add(b);
        }

        if (!hasHotel && !hotels.isEmpty()) {
            Hotel h = hotels.get(0);
            Users.Booking b = new Users.Booking();
            b.setType("Hotel");
            b.setBookingId(h.getId() != null ? h.getId() : "HOTEL-DEMO-01");
            b.setDate(Instant.now().minusSeconds(86400 * 5).toString());
            b.setQuantity(1);
            b.setTotalPrice(h.getPricePerNight() * 2);
            b.setRoomType("Deluxe Sea Facing Room");
            b.setHotelName(h.gethotelName());
            targetUser.getBookings().add(b);
        }

        if (!hasHomestay && !homestays.isEmpty()) {
            Homestay hs = homestays.get(0);
            Users.Booking b = new Users.Booking();
            b.setType("Homestay");
            b.setBookingId(hs.getId() != null ? hs.getId() : "HOMESTAY-DEMO-01");
            b.setDate(Instant.now().minusSeconds(86400 * 10).toString());
            b.setQuantity(1);
            b.setTotalPrice(hs.getPricePerNight() * 3);
            targetUser.getBookings().add(b);
        }

        if (!hasTrain && !trains.isEmpty()) {
            Train t = trains.get(0);
            Users.Booking b = new Users.Booking();
            b.setType("Train");
            b.setBookingId(t.getId() != null ? t.getId() : "TRAIN-DEMO-01");
            b.setDate(Instant.now().minusSeconds(86400 * 1).toString());
            b.setQuantity(1);
            b.setTotalPrice(t.getPrice());
            b.setSeatNumbers(List.of("C3-45 (Chair Car)"));
            targetUser.getBookings().add(b);
        }

        if (!hasBus && !buses.isEmpty()) {
            Bus bus = buses.get(0);
            Users.Booking b = new Users.Booking();
            b.setType("Bus");
            b.setBookingId(bus.getId() != null ? bus.getId() : "BUS-DEMO-01");
            b.setDate(Instant.now().minusSeconds(86400 * 7).toString());
            b.setQuantity(1);
            b.setTotalPrice(bus.getPrice());
            b.setSeatNumbers(List.of("Upper Berth U4"));
            targetUser.getBookings().add(b);
        }

        if (!hasCab && !cabs.isEmpty()) {
            Cab c = cabs.get(0);
            Users.Booking b = new Users.Booking();
            b.setType("Cab");
            b.setBookingId(c.getId() != null ? c.getId() : "CAB-DEMO-01");
            b.setDate(Instant.now().minusSeconds(86400 * 3).toString());
            b.setQuantity(1);
            b.setTotalPrice(c.getPrice());
            targetUser.getBookings().add(b);
        }

        if (!hasHoliday) {
            Users.Booking b = new Users.Booking();
            b.setType("Holiday");
            b.setBookingId("HOLIDAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            b.setDate(Instant.now().minusSeconds(86400 * 14).toString());
            b.setQuantity(2);
            b.setTotalPrice(38500.0);
            b.setDestination("Jaipur, Rajasthan");
            b.setPackageDays(5);
            b.setHotelName("Rambagh Palace");
            b.setStyle("Luxury Heritage");
            targetUser.getBookings().add(b);
        }

        userRepository.save(targetUser);
        log.info("User {} now has {} total bookings.", targetUser.getEmail(), targetUser.getBookings().size());
        return targetUser.getBookings().size();
    }
}
