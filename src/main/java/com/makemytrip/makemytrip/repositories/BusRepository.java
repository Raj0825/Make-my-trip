package com.makemytrip.makemytrip.repositories;
import com.makemytrip.makemytrip.models.Bus;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface BusRepository extends MongoRepository<Bus,String>{
}
