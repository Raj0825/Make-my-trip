package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "flight_tracking")
public class FlightTracking {

    @Id
    private String _id;

    private String userId;
    private String flightId;
    private Instant trackedAt = Instant.now();

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getFlightId() { return flightId; }
    public void setFlightId(String flightId) { this.flightId = flightId; }

    public Instant getTrackedAt() { return trackedAt; }
    public void setTrackedAt(Instant trackedAt) { this.trackedAt = trackedAt; }
}