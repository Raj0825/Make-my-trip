package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Review;
import com.makemytrip.makemytrip.repositories.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    // A review gets auto-hidden from public view once it collects enough flags,
    // pending a moderator's decision (still visible to moderators via /flagged).
    private static final int AUTO_HIDE_FLAG_THRESHOLD = 3;

    public Review createReview(Review review) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        if (review.getServiceType() == null || review.getServiceId() == null) {
            throw new RuntimeException("serviceType and serviceId are required");
        }
        review.setId(null);
        review.setCreatedAt(Instant.now());
        review.setModerationStatus("VISIBLE");
        return reviewRepository.save(review);
    }

    public List<Review> getReviews(String serviceType, String serviceId, String sort,
                                   Integer minRating, Integer maxRating) {
        List<Review> reviews = reviewRepository
                .findByServiceTypeAndServiceIdAndModerationStatusNot(serviceType, serviceId, "REMOVED");

        // Hide reviews under moderation review from the public list
        reviews.removeIf(r -> "FLAGGED".equals(r.getModerationStatus()));

        if (minRating != null) reviews.removeIf(r -> r.getRating() < minRating);
        if (maxRating != null) reviews.removeIf(r -> r.getRating() > maxRating);

        Comparator<Review> comparator = switch (sort == null ? "newest" : sort) {
            case "helpful" -> Comparator.comparingInt(Review::getHelpfulCount).reversed();
            case "rating" -> Comparator.comparingInt(Review::getRating).reversed();
            default -> Comparator.comparing(Review::getCreatedAt).reversed(); // "newest"
        };

        reviews.sort(comparator);
        return reviews;
    }

    public Review addReply(String reviewId, String userId, String userName, String text) {
        Review review = getOrThrow(reviewId);
        Review.Reply reply = new Review.Reply();
        reply.setId(UUID.randomUUID().toString());
        reply.setUserId(userId);
        reply.setUserName(userName);
        reply.setText(text);
        reply.setCreatedAt(Instant.now());
        review.getReplies().add(reply);
        return reviewRepository.save(review);
    }

    public Review markHelpful(String reviewId, String userId) {
        Review review = getOrThrow(reviewId);
        // toggle: if already marked helpful by this user, un-mark it
        if (review.getHelpfulUserIds().contains(userId)) {
            review.getHelpfulUserIds().remove(userId);
        } else {
            review.getHelpfulUserIds().add(userId);
        }
        return reviewRepository.save(review);
    }

    public Review flagReview(String reviewId, String userId, String reason) {
        Review review = getOrThrow(reviewId);
        review.getFlaggedByUserIds().add(userId);
        if (reason != null && !reason.isBlank()) {
            review.getFlagReasons().add(reason);
        }
        if (review.getFlagCount() >= AUTO_HIDE_FLAG_THRESHOLD
                && "VISIBLE".equals(review.getModerationStatus())) {
            review.setModerationStatus("FLAGGED");
        }
        return reviewRepository.save(review);
    }

    public List<Review> getFlaggedReviews() {
        return reviewRepository.findByModerationStatus("FLAGGED");
    }

    public Review moderateReview(String reviewId, String action) {
        Review review = getOrThrow(reviewId);
        switch (action) {
            case "APPROVE" -> review.setModerationStatus("VISIBLE");
            case "REMOVE" -> review.setModerationStatus("REMOVED");
            default -> throw new RuntimeException("action must be APPROVE or REMOVE");
        }
        return reviewRepository.save(review);
    }

    private Review getOrThrow(String reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }
}