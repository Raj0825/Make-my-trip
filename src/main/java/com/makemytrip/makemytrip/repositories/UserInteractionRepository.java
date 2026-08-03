package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.UserInteraction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserInteractionRepository extends MongoRepository<UserInteraction, String> {
    List<UserInteraction> findByUserId(String userId);
    List<UserInteraction> findByUserIdAndAction(String userId, String action);
    List<UserInteraction> findByAction(String action);
}