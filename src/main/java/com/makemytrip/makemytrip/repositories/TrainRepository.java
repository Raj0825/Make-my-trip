package com.makemytrip.makemytrip.repositories;
import com.makemytrip.makemytrip.models.Train;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface TrainRepository extends MongoRepository<Train,String>{
}
