package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Document(collection = "reviews")
public class Review {

    @Id
    private String _id;

    // "Flight", "Hotel", "Train", "Bus", "Cab", "Homestay"
    private String serviceType;

    // id of the Flight/Hotel/Train/Bus/Cab/Homestay document being reviewed
    private String serviceId;

    private String userId;
    private String userName;

    private int rating;           // 1-5
    private String reviewText;
    private List<String> photoUrls = new ArrayList<>();

    private Instant createdAt = Instant.now();

    private Set<String> helpfulUserIds = new HashSet<>(); // userIds who marked "helpful"

    private Set<String> flaggedByUserIds = new HashSet<>();
    private List<String> flagReasons = new ArrayList<>();

    // VISIBLE, FLAGGED (awaiting moderator), REMOVED
    private String moderationStatus = "VISIBLE";

    private List<Reply> replies = new ArrayList<>();

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }

    public List<String> getPhotoUrls() { return photoUrls; }
    public void setPhotoUrls(List<String> photoUrls) { this.photoUrls = photoUrls; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Set<String> getHelpfulUserIds() { return helpfulUserIds; }
    public void setHelpfulUserIds(Set<String> helpfulUserIds) { this.helpfulUserIds = helpfulUserIds; }
    public int getHelpfulCount() { return helpfulUserIds == null ? 0 : helpfulUserIds.size(); }

    public Set<String> getFlaggedByUserIds() { return flaggedByUserIds; }
    public void setFlaggedByUserIds(Set<String> flaggedByUserIds) { this.flaggedByUserIds = flaggedByUserIds; }
    public int getFlagCount() { return flaggedByUserIds == null ? 0 : flaggedByUserIds.size(); }

    public List<String> getFlagReasons() { return flagReasons; }
    public void setFlagReasons(List<String> flagReasons) { this.flagReasons = flagReasons; }

    public String getModerationStatus() { return moderationStatus; }
    public void setModerationStatus(String moderationStatus) { this.moderationStatus = moderationStatus; }

    public List<Reply> getReplies() { return replies; }
    public void setReplies(List<Reply> replies) { this.replies = replies; }

    public static class Reply {
        private String id;
        private String userId;
        private String userName;
        private String text;
        private Instant createdAt = Instant.now();

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }
}