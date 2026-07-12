package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.Review;
import com.makemytrip.makemytrip.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // Create a review
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        try {
            return ResponseEntity.ok(reviewService.createReview(review));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get reviews for a given service, with sorting + rating filter
    // sort: "helpful" | "newest" | "rating"  (default "newest")
    @GetMapping("/{serviceType}/{serviceId}")
    public ResponseEntity<List<Review>> getReviews(
            @PathVariable String serviceType,
            @PathVariable String serviceId,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating) {
        return ResponseEntity.ok(reviewService.getReviews(serviceType, serviceId, sort, minRating, maxRating));
    }

    // Reply to a review
    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<?> reply(@PathVariable String reviewId, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(reviewService.addReply(
                    reviewId, body.get("userId"), body.get("userName"), body.get("text")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Mark / un-mark a review as helpful (toggle)
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<?> markHelpful(@PathVariable String reviewId, @RequestParam String userId) {
        try {
            return ResponseEntity.ok(reviewService.markHelpful(reviewId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Flag a review as inappropriate
    @PostMapping("/{reviewId}/flag")
    public ResponseEntity<?> flag(@PathVariable String reviewId, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(reviewService.flagReview(
                    reviewId, body.get("userId"), body.get("reason")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Moderator endpoints ----

    @GetMapping("/admin/flagged")
    public ResponseEntity<List<Review>> getFlagged() {
        return ResponseEntity.ok(reviewService.getFlaggedReviews());
    }

    // action = APPROVE | REMOVE
    @PutMapping("/admin/{reviewId}/moderate")
    public ResponseEntity<?> moderate(@PathVariable String reviewId, @RequestParam String action) {
        try {
            return ResponseEntity.ok(reviewService.moderateReview(reviewId, action));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}