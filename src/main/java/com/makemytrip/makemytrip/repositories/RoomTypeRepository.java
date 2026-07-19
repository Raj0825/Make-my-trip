package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.RoomType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RoomTypeRepository extends MongoRepository<RoomType, String> {
    List<RoomType> findByHotelId(String hotelId);
}