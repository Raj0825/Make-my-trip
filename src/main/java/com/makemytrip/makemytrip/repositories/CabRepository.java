package com.makemytrip.makemytrip.repositories;
import com.makemytrip.makemytrip.models.Cab;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CabRepository extends MongoRepository<Cab,String>{
}
