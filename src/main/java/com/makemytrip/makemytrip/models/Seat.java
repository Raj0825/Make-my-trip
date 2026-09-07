package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Tracks which specific seat numbers are actually taken for a given entity
 * (Train or Bus), the same way FlightSeat does for flights. Train/Bus seat
 * *maps* (layout, berth types) are generated deterministically on the
 * frontend since they're purely cosmetic — this collection is only the
 * source of truth for "is this seat number already booked", so the same
 * seat can never be sold twice.
 */
@Document(collection = "seat_inventory")
public class Seat {

    @Id
    private String _id;

    private String entityType;   // "Train" or "Bus"
    private String entityId;
    private String seatNumber;   // e.g. "S1-14"
    private String bookedByUserId;
    private String bookingId;    // ties the seat back to the booking, for release-on-cancel

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public String getBookedByUserId() { return bookedByUserId; }
    public void setBookedByUserId(String bookedByUserId) { this.bookedByUserId = bookedByUserId; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
}