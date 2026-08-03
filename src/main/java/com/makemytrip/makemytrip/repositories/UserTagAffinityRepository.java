package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.UserTagAffinity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserTagAffinityRepository extends MongoRepository<UserTagAffinity, String> {
    List<UserTagAffinity> findByUserId(String userId);
    Optional<UserTagAffinity> findByUserIdAndTag(String userId, String tag);
    List<UserTagAffinity> findByTag(String tag);
}