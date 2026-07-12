package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {

    List<Review> findByServiceTypeAndServiceIdAndModerationStatusNot(
            String serviceType, String serviceId, String moderationStatus);

    List<Review> findByModerationStatus(String moderationStatus);
}