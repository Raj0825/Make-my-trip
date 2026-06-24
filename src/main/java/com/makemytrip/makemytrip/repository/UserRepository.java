package com.makemytrip.makemytrip.repository;

import com.makemytrip.makemytrip.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

    User findByEmail(String email);

}

