package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.PushSubscription;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PushSubscriptionRepository extends MongoRepository<PushSubscription, String> {
    Optional<PushSubscription> findByUserId(String userId);
    void deleteByUserId(String userId);
}