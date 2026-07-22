package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "price_freeze")
public class PriceFreeze {

    @Id
    private String _id;

    private String userId;
    private String entityType;
    private String entityId;

    private double frozenPrice;
    private long createdAt;
    private long expiresAt;
    private boolean consumed = false; // set true once used on an actual booking

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public double getFrozenPrice() { return frozenPrice; }
    public void setFrozenPrice(double frozenPrice) { this.frozenPrice = frozenPrice; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }

    public boolean isConsumed() { return consumed; }
    public void setConsumed(boolean consumed) { this.consumed = consumed; }

    public boolean isActive() {
        return !consumed && System.currentTimeMillis() < expiresAt;
    }
}