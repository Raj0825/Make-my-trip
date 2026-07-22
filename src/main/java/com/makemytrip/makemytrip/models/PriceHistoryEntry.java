package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "price_history")
public class PriceHistoryEntry {

    @Id
    private String _id;

    private String entityType;
    private String entityId;

    private double price;
    private double multiplier;
    private double demandFactor;
    private double seasonalFactor;
    private String reason;      // human-readable summary, e.g. "Peak season (Diwali) + high demand"
    private long timestamp;

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public double getMultiplier() { return multiplier; }
    public void setMultiplier(double multiplier) { this.multiplier = multiplier; }

    public double getDemandFactor() { return demandFactor; }
    public void setDemandFactor(double demandFactor) { this.demandFactor = demandFactor; }

    public double getSeasonalFactor() { return seasonalFactor; }
    public void setSeasonalFactor(double seasonalFactor) { this.seasonalFactor = seasonalFactor; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
}