package com.makemytrip.makemytrip.repositories;
import com.makemytrip.makemytrip.models.Homestay;

import org.springframework.data.mongodb.repository.MongoRepository;
public interface HomestayRepository extends MongoRepository<Homestay,String>{
}
