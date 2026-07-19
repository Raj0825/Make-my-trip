package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "flight_seats")
public class FlightSeat {

    @Id
    private String _id;

    private String flightId;
    private String seatNumber;   // e.g. "12A"
    private String seatClass;    // ECONOMY, PREMIUM
    private double surcharge;    // extra cost over base fare for this seat
    private String status = "AVAILABLE"; // AVAILABLE, BOOKED
    private String bookedByUserId;
    private String bookingId;    // ties the seat back to the specific booking, for release-on-cancel

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getFlightId() { return flightId; }
    public void setFlightId(String flightId) { this.flightId = flightId; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public String getSeatClass() { return seatClass; }
    public void setSeatClass(String seatClass) { this.seatClass = seatClass; }

    public double getSurcharge() { return surcharge; }
    public void setSurcharge(double surcharge) { this.surcharge = surcharge; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBookedByUserId() { return bookedByUserId; }
    public void setBookedByUserId(String bookedByUserId) { this.bookedByUserId = bookedByUserId; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
}