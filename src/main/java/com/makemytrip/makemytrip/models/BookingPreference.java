package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "booking_preferences")
public class BookingPreference {

    @Id
    private String _id;

    private String userId;

    // WINDOW, AISLE, MIDDLE, NONE
    private String preferredSeatType = "NONE";
    // ECONOMY, PREMIUM
    private String preferredSeatClass = "ECONOMY";

    // e.g. "Deluxe Room" — matched by name against available room types
    private String preferredRoomTypeName;

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPreferredSeatType() { return preferredSeatType; }
    public void setPreferredSeatType(String preferredSeatType) { this.preferredSeatType = preferredSeatType; }

    public String getPreferredSeatClass() { return preferredSeatClass; }
    public void setPreferredSeatClass(String preferredSeatClass) { this.preferredSeatClass = preferredSeatClass; }

    public String getPreferredRoomTypeName() { return preferredRoomTypeName; }
    public void setPreferredRoomTypeName(String preferredRoomTypeName) { this.preferredRoomTypeName = preferredRoomTypeName; }
}