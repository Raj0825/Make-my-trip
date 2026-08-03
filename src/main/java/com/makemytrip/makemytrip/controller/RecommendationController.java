package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.services.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired private RecommendationService recommendationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<RecommendationService.Recommendation>> getRecommendations(
            @PathVariable String userId,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(recommendationService.getRecommendations(userId, limit));
    }

    public record TrackRequest(String userId, String entityType, String entityId, String action) {}

    /** Call when a user views a booking detail page, so browsing itself feeds the engine. */
    @PostMapping("/track")
    public ResponseEntity<?> track(@RequestBody TrackRequest req) {
        recommendationService.recordInteraction(req.userId(), req.entityType(), req.entityId(),
                req.action() == null ? "VIEWED" : req.action());
        return ResponseEntity.ok().build();
    }

    public record FeedbackRequest(String userId, String entityType, String entityId, String feedback) {}

    /** "Helpful" or "Irrelevant" feedback on a specific recommendation - the feedback loop. */
    @PostMapping("/feedback")
    public ResponseEntity<?> feedback(@RequestBody FeedbackRequest req) {
        recommendationService.recordFeedback(req.userId(), req.entityType(), req.entityId(), req.feedback());
        return ResponseEntity.ok().build();
    }
}