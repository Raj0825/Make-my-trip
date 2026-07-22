package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.PricingProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PricingProfileRepository extends MongoRepository<PricingProfile, String> {
    Optional<PricingProfile> findByEntityTypeAndEntityId(String entityType, String entityId);
    List<PricingProfile> findByEntityType(String entityType);
}