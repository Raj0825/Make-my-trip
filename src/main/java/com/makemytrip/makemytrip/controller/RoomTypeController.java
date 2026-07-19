package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.RoomType;
import com.makemytrip.makemytrip.repositories.RoomTypeRepository;
import com.makemytrip.makemytrip.services.RoomTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class RoomTypeController {

    @Autowired private RoomTypeService roomTypeService;
    @Autowired private RoomTypeRepository roomTypeRepository;

    // Public: room grid shown on the hotel detail page
    @GetMapping("/room-types/{hotelId}")
    public ResponseEntity<List<RoomType>> getRoomTypes(@PathVariable String hotelId) {
        return ResponseEntity.ok(roomTypeService.getOrCreateRoomTypes(hotelId));
    }

    // Admin: manual override of a room type (price, availability, photos, etc.)
    @PutMapping("/admin/room-types/{id}")
    public ResponseEntity<?> editRoomType(@PathVariable String id, @RequestBody RoomType updated) {
        RoomType rt = roomTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room type not found"));
        rt.setName(updated.getName());
        rt.setPricePerNight(updated.getPricePerNight());
        rt.setTotalRooms(updated.getTotalRooms());
        rt.setAvailableRooms(updated.getAvailableRooms());
        rt.setAmenities(updated.getAmenities());
        if (updated.getPhotoUrls() != null && !updated.getPhotoUrls().isEmpty()) {
            rt.setPhotoUrls(updated.getPhotoUrls());
        }
        rt.setPremium(updated.isPremium());
        return ResponseEntity.ok(roomTypeRepository.save(rt));
    }
}