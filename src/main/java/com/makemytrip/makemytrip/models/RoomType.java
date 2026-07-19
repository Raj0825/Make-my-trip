package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "room_types")
public class RoomType {

    @Id
    private String _id;

    private String hotelId;
    private String name;          // e.g. "Standard Room", "Deluxe Room", "Suite"
    private double pricePerNight;
    private int totalRooms;
    private int availableRooms;
    private String amenities;
    private List<String> photoUrls = new ArrayList<>();
    private boolean premium = false;

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getHotelId() { return hotelId; }
    public void setHotelId(String hotelId) { this.hotelId = hotelId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(double pricePerNight) { this.pricePerNight = pricePerNight; }

    public int getTotalRooms() { return totalRooms; }
    public void setTotalRooms(int totalRooms) { this.totalRooms = totalRooms; }

    public int getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(int availableRooms) { this.availableRooms = availableRooms; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photoUrls) { this.photoUrls = photoUrls; }

    public boolean isPremium() { return premium; }
    public void setPremium(boolean premium) { this.premium = premium; }
}