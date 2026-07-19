package com.makemytrip.makemytrip.models;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.ArrayList;
@Document(collection = "users")
public class Users {
    @Id
    private String _id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role;
    private String phoneNumber;
    private List<Booking> bookings = new ArrayList<>();

    public String getFirstName() {return firstName;}
    public String getId() { return _id; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getPassword() {return password;}
    public String getEmail() {return email;}
    public String getRole() {return role;}
    public void setPassword(String password) {this.password = password;}
    public void setRole(String role) {this.role = role;}
    public List<Booking> getBookings(){return bookings;}
    public void setBookings(List<Booking> bookings){this.bookings=bookings;}

    public static class Booking {
        private String type;
        private String bookingId;
        private String date;
        private int quantity;
        private double totalPrice;

        // Cancellation fields
        private boolean cancelled = false;
        private String cancellationReason;
        private double refundAmount = 0;
        private String refundStatus; // PENDING, PROCESSED, COMPLETED
        private String cancelledAt;
        private String expectedRefundDate;

        // Seat / room selection fields
        private java.util.List<String> seatNumbers; // e.g. ["12A", "12B"] — flights only
        private String roomType;                    // e.g. "Deluxe Room" — hotels only

        // Getters and Setters — original fields
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getBookingId() { return bookingId; }
        public void setBookingId(String bookingId) { this.bookingId = bookingId; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public double getTotalPrice() { return totalPrice; }
        public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

        // Getters and Setters — cancellation fields
        public boolean isCancelled() { return cancelled; }
        public void setCancelled(boolean cancelled) { this.cancelled = cancelled; }
        public String getCancellationReason() { return cancellationReason; }
        public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
        public double getRefundAmount() { return refundAmount; }
        public void setRefundAmount(double refundAmount) { this.refundAmount = refundAmount; }
        public String getRefundStatus() { return refundStatus; }
        public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }
        public String getCancelledAt() { return cancelledAt; }
        public void setCancelledAt(String cancelledAt) { this.cancelledAt = cancelledAt; }
        public String getExpectedRefundDate() { return expectedRefundDate; }
        public void setExpectedRefundDate(String expectedRefundDate) { this.expectedRefundDate = expectedRefundDate; }

        // Getters and Setters — seat / room selection fields
        public java.util.List<String> getSeatNumbers() { return seatNumbers; }
        public void setSeatNumbers(java.util.List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
        public String getRoomType() { return roomType; }
        public void setRoomType(String roomType) { this.roomType = roomType; }
    }
}