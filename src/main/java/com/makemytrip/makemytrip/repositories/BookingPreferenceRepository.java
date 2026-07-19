package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.BookingPreference;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface BookingPreferenceRepository extends MongoRepository<BookingPreference, String> {
    Optional<BookingPreference> findByUserId(String userId);
}