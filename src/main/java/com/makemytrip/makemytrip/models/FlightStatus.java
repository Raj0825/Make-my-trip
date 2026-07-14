package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "flight_status")
public class FlightStatus {

    @Id
    private String _id;

    private String flightId; // references Flight._id

    // ON_TIME, BOARDING, DELAYED, DEPARTED, IN_AIR, LANDED, CANCELLED
    private String status = "ON_TIME";

    private Integer delayMinutes;       // null unless status is DELAYED
    private String delayReason;         // null unless status is DELAYED

    private String revisedDepartureTime; // null unless changed from schedule
    private String estimatedArrivalTime; // dynamically updated

    private Instant lastUpdated = Instant.now();

    private List<StatusEvent> history = new ArrayList<>();

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getFlightId() { return flightId; }
    public void setFlightId(String flightId) { this.flightId = flightId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getDelayMinutes() { return delayMinutes; }
    public void setDelayMinutes(Integer delayMinutes) { this.delayMinutes = delayMinutes; }

    public String getDelayReason() { return delayReason; }
    public void setDelayReason(String delayReason) { this.delayReason = delayReason; }

    public String getRevisedDepartureTime() { return revisedDepartureTime; }
    public void setRevisedDepartureTime(String revisedDepartureTime) { this.revisedDepartureTime = revisedDepartureTime; }

    public String getEstimatedArrivalTime() { return estimatedArrivalTime; }
    public void setEstimatedArrivalTime(String estimatedArrivalTime) { this.estimatedArrivalTime = estimatedArrivalTime; }

    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }

    public List<StatusEvent> getHistory() { return history; }
    public void setHistory(List<StatusEvent> history) { this.history = history; }

    public static class StatusEvent {
        private String status;
        private String message;
        private Instant timestamp = Instant.now();

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }
}