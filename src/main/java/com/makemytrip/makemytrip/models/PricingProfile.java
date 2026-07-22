package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

/**
 * Anchor record for the Dynamic Pricing Engine.
 *
 * One profile exists per bookable item (entityType + entityId). The "basePrice"
 * is the stable, undiscounted price the item was created/listed with. Every
 * recalculation is derived fresh from basePrice * multiplier so that adjustments
 * never compound on top of previous adjustments - this keeps the pricing
 * transparent and predictable for users instead of drifting unpredictably.
 */
@Document(collection = "pricing_profile")
@CompoundIndex(name = "entity_idx", def = "{'entityType': 1, 'entityId': 1}", unique = true)
public class PricingProfile {

    @Id
    private String _id;

    private String entityType;      // FLIGHT, HOTEL, TRAIN, BUS, CAB, HOMESTAY
    private String entityId;

    private double basePrice;       // stable anchor price, set once
    private int totalCapacity;      // best-known capacity ceiling (self-learned, see DynamicPricingService)

    private double currentMultiplier = 1.0;
    private double currentPrice;

    private double demandFactor = 0.0;
    private double seasonalFactor = 0.0;
    private String seasonalReason = "";

    private long lastUpdated;

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public double getBasePrice() { return basePrice; }
    public void setBasePrice(double basePrice) { this.basePrice = basePrice; }

    public int getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(int totalCapacity) { this.totalCapacity = totalCapacity; }

    public double getCurrentMultiplier() { return currentMultiplier; }
    public void setCurrentMultiplier(double currentMultiplier) { this.currentMultiplier = currentMultiplier; }

    public double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }

    public double getDemandFactor() { return demandFactor; }
    public void setDemandFactor(double demandFactor) { this.demandFactor = demandFactor; }

    public double getSeasonalFactor() { return seasonalFactor; }
    public void setSeasonalFactor(double seasonalFactor) { this.seasonalFactor = seasonalFactor; }

    public String getSeasonalReason() { return seasonalReason; }
    public void setSeasonalReason(String seasonalReason) { this.seasonalReason = seasonalReason; }

    public long getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(long lastUpdated) { this.lastUpdated = lastUpdated; }
}