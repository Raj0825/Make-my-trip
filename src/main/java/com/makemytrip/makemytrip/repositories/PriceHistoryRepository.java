package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.PriceHistoryEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PriceHistoryRepository extends MongoRepository<PriceHistoryEntry, String> {
    List<PriceHistoryEntry> findByEntityTypeAndEntityIdOrderByTimestampAsc(String entityType, String entityId);
    List<PriceHistoryEntry> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);
}