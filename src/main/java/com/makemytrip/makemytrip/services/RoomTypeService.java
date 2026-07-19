package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.RoomType;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.RoomTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomTypeService {

    @Autowired private RoomTypeRepository roomTypeRepository;
    @Autowired private HotelRepository hotelRepository;

    // Stock photo sets per room tier — used only the first time a hotel's
    // room types are generated, so every hotel has a believable photo gallery
    // without needing manual uploads.
    private static final List<String> STANDARD_PHOTOS = List.of(
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800"
    );
    private static final List<String> DELUXE_PHOTOS = List.of(
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800"
    );
    private static final List<String> SUITE_PHOTOS = List.of(
            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800"
    );

    // Generates 3 room tiers for a hotel the first time anyone looks at its
    // room grid, priced off the hotel's base pricePerNight.
    public List<RoomType> getOrCreateRoomTypes(String hotelId) {
        List<RoomType> existing = roomTypeRepository.findByHotelId(hotelId);
        if (!existing.isEmpty()) return existing;

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        int totalRooms = Math.max(hotel.getAvailableRooms(), 3);
        int perTier = Math.max(1, totalRooms / 3);

        RoomType standard = buildRoomType(hotelId, "Standard Room", hotel.getPricePerNight(),
                perTier, hotel.getamenities(), STANDARD_PHOTOS, false);
        RoomType deluxe = buildRoomType(hotelId, "Deluxe Room", hotel.getPricePerNight() * 1.4,
                perTier, hotel.getamenities() + ", City View", DELUXE_PHOTOS, false);
        RoomType suite = buildRoomType(hotelId, "Suite", hotel.getPricePerNight() * 2.2,
                Math.max(1, totalRooms - perTier * 2), hotel.getamenities() + ", Living Area, Premium Bar",
                SUITE_PHOTOS, true);

        return roomTypeRepository.saveAll(List.of(standard, deluxe, suite));
    }

    private RoomType buildRoomType(String hotelId, String name, double price, int rooms,
                                   String amenities, List<String> photos, boolean premium) {
        RoomType rt = new RoomType();
        rt.setHotelId(hotelId);
        rt.setName(name);
        rt.setPricePerNight(Math.round(price * 100.0) / 100.0);
        rt.setTotalRooms(rooms);
        rt.setAvailableRooms(rooms);
        rt.setAmenities(amenities);
        rt.setPhotoUrls(photos);
        rt.setPremium(premium);
        return rt;
    }

    public RoomType bookRoom(String roomTypeId, int quantity) {
        RoomType rt = roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new RuntimeException("Room type not found"));
        if (rt.getAvailableRooms() < quantity) {
            throw new RuntimeException("Not enough rooms available for " + rt.getName());
        }
        rt.setAvailableRooms(rt.getAvailableRooms() - quantity);
        return roomTypeRepository.save(rt);
    }

    // Frees up rooms when a booking is cancelled — matched by hotel + room type name
    // since Users.Booking stores the type name, not the RoomType's Mongo id.
    public void releaseRoomByName(String hotelId, String roomTypeName, int quantity) {
        if (roomTypeName == null) return;
        roomTypeRepository.findByHotelId(hotelId).stream()
                .filter(rt -> roomTypeName.equals(rt.getName()))
                .findFirst()
                .ifPresent(rt -> {
                    rt.setAvailableRooms(Math.min(rt.getTotalRooms(), rt.getAvailableRooms() + quantity));
                    roomTypeRepository.save(rt);
                });
    }
}