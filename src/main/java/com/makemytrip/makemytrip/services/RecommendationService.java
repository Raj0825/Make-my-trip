package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.*;
import com.makemytrip.makemytrip.repositories.*;
import com.makemytrip.makemytrip.util.DestinationTagger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Personalized recommendations, combining two signals:
 *
 *  1. Content-based filtering: what travel-style tags (beach, hill station, heritage...)
 *     has this user shown affinity for, based on what they've viewed/booked? Recommend
 *     more of that.
 *
 *  2. Collaborative filtering: which *other* users share this user's top tag(s)? Surface
 *     the things those similar users booked that this user hasn't seen yet - "people
 *     who liked what you liked also booked this."
 *
 * Every recommendation carries a plain-language "reason" so the "Why this recommendation?"
 * tooltip is genuinely explaining the real signal, not a canned string.
 *
 * A feedback loop (helpful/irrelevant) adjusts the user's tag affinities directly, so the
 * engine's accuracy compounds over time instead of repeating the same suggestion forever.
 */
@Service
public class RecommendationService {

    private static final double VIEW_WEIGHT = 0.5;
    private static final double BOOK_WEIGHT = 3.0;
    private static final double HELPFUL_BONUS = 2.0;
    private static final double IRRELEVANT_PENALTY = -2.5;

    @Autowired private UserInteractionRepository userInteractionRepository;
    @Autowired private UserTagAffinityRepository userTagAffinityRepository;
    @Autowired private RecommendationFeedbackRepository recommendationFeedbackRepository;

    @Autowired private FlightRepository flightRepository;
    @Autowired private HotelRepository hotelRepository;
    @Autowired private HomestayRepository homestayRepository;

    public record Listing(String entityType, String entityId, String name, String location,
                          double price, List<String> tags) {}

    public record Recommendation(String entityType, String entityId, String name, String location,
                                 double price, String reason, List<String> matchedTags) {}

    // ---------------------------------------------------------------------
    // Tracking - call these as users browse and book
    // ---------------------------------------------------------------------

    /** Call when a user views or books something, to feed the recommendation engine. */
    public void recordInteraction(String userId, String entityType, String entityId, String action) {
        if (userId == null || userId.isBlank()) return;
        Listing listing = lookupListing(entityType, entityId);
        if (listing == null) return;

        UserInteraction interaction = new UserInteraction();
        interaction.setUserId(userId);
        interaction.setEntityType(entityType);
        interaction.setEntityId(entityId);
        interaction.setLocation(listing.location());
        interaction.setTags(listing.tags());
        interaction.setAction(action);
        interaction.setTimestamp(System.currentTimeMillis());
        userInteractionRepository.save(interaction);

        double weight = "BOOKED".equals(action) ? BOOK_WEIGHT : VIEW_WEIGHT;
        bumpAffinities(userId, listing.tags(), weight);
    }

    // ---------------------------------------------------------------------
    // Feedback loop
    // ---------------------------------------------------------------------

    public void recordFeedback(String userId, String entityType, String entityId, String feedback) {
        RecommendationFeedback fb = new RecommendationFeedback();
        fb.setUserId(userId);
        fb.setEntityType(entityType);
        fb.setEntityId(entityId);
        fb.setFeedback(feedback);
        fb.setTimestamp(System.currentTimeMillis());
        recommendationFeedbackRepository.save(fb);

        Listing listing = lookupListing(entityType, entityId);
        if (listing == null) return;
        double delta = "HELPFUL".equals(feedback) ? HELPFUL_BONUS : IRRELEVANT_PENALTY;
        bumpAffinities(userId, listing.tags(), delta);
    }

    private void bumpAffinities(String userId, List<String> tags, double delta) {
        for (String tag : tags) {
            UserTagAffinity affinity = userTagAffinityRepository.findByUserIdAndTag(userId, tag)
                    .orElseGet(() -> {
                        UserTagAffinity a = new UserTagAffinity();
                        a.setUserId(userId);
                        a.setTag(tag);
                        a.setScore(0);
                        return a;
                    });
            affinity.setScore(affinity.getScore() + delta);
            userTagAffinityRepository.save(affinity);
        }
    }

    // ---------------------------------------------------------------------
    // Recommendation generation
    // ---------------------------------------------------------------------

    public List<Recommendation> getRecommendations(String userId, int limit) {
        List<UserTagAffinity> affinities = userId != null
                ? userTagAffinityRepository.findByUserId(userId)
                : List.of();

        Set<String> alreadySeen = userId != null
                ? userInteractionRepository.findByUserId(userId).stream()
                .map(i -> i.getEntityType() + ":" + i.getEntityId())
                .collect(Collectors.toSet())
                : Set.of();

        Set<String> suppressed = userId != null
                ? recommendationFeedbackRepository.findByUserIdAndFeedback(userId, "IRRELEVANT").stream()
                .map(f -> f.getEntityType() + ":" + f.getEntityId())
                .collect(Collectors.toSet())
                : Set.of();

        List<Listing> allListings = allListings();

        if (affinities.isEmpty()) {
            return List.of(); // no history yet - nothing to base a recommendation on
        }

        // Top tags this user has a positive affinity for (content-based signal)
        List<String> topTags = affinities.stream()
                .filter(a -> a.getScore() > 0)
                .sorted(Comparator.comparingDouble(UserTagAffinity::getScore).reversed())
                .map(UserTagAffinity::getTag)
                .limit(3)
                .toList();

        if (topTags.isEmpty()) {
            return List.of(); // only negative/neutral affinities so far - nothing confident to suggest
        }

        // Collaborative signal: other users who also have a strong affinity for the same top tag
        Set<String> similarUserIds = new HashSet<>();
        for (String tag : topTags) {
            userTagAffinityRepository.findByTag(tag).stream()
                    .filter(a -> !a.getUserId().equals(userId) && a.getScore() > 0)
                    .sorted(Comparator.comparingDouble(UserTagAffinity::getScore).reversed())
                    .limit(20)
                    .forEach(a -> similarUserIds.add(a.getUserId()));
        }
        Set<String> collaborativeEntityKeys = similarUserIds.isEmpty() ? Set.of()
                : userInteractionRepository.findByAction("BOOKED").stream()
                .filter(i -> similarUserIds.contains(i.getUserId()))
                .map(i -> i.getEntityType() + ":" + i.getEntityId())
                .collect(Collectors.toSet());

        List<Recommendation> results = new ArrayList<>();
        for (Listing listing : allListings) {
            String key = listing.entityType() + ":" + listing.entityId();
            if (alreadySeen.contains(key) || suppressed.contains(key)) continue;

            List<String> matchedTags = listing.tags().stream().filter(topTags::contains).toList();
            boolean collaborativeMatch = collaborativeEntityKeys.contains(key);

            if (matchedTags.isEmpty() && !collaborativeMatch) continue;

            String reason;
            if (!matchedTags.isEmpty() && collaborativeMatch) {
                reason = "You liked " + matchedTags.get(0) + "! Try " + listing.location()
                        + " — also popular with travelers who share your taste.";
            } else if (!matchedTags.isEmpty()) {
                reason = "You liked " + matchedTags.get(0) + "! Try " + listing.location() + ".";
            } else {
                reason = "Popular with travelers who liked similar destinations to you.";
            }

            results.add(new Recommendation(listing.entityType(), listing.entityId(), listing.name(),
                    listing.location(), listing.price(), reason, matchedTags));
        }

        // Rank by number of matched tags, then collaborative boost, then cheaper first
        results.sort((a, b) -> {
            int tagCompare = Integer.compare(b.matchedTags().size(), a.matchedTags().size());
            if (tagCompare != 0) return tagCompare;
            boolean aCollab = collaborativeEntityKeys.contains(a.entityType() + ":" + a.entityId());
            boolean bCollab = collaborativeEntityKeys.contains(b.entityType() + ":" + b.entityId());
            if (aCollab != bCollab) return aCollab ? -1 : 1;
            return Double.compare(a.price(), b.price());
        });

        List<Recommendation> topResults = results.stream().limit(limit).toList();
        return topResults; // strictly based on this user's own history - no trending fallback
    }

    // ---------------------------------------------------------------------
    // Listing lookup helpers
    // ---------------------------------------------------------------------

    private List<Listing> allListings() {
        List<Listing> listings = new ArrayList<>();
        hotelRepository.findAll().forEach(h -> listings.add(new Listing("HOTEL", h.getId(), h.gethotelName(),
                h.getLocation(), h.getPricePerNight(), DestinationTagger.tagsFor(h.getLocation()))));
        homestayRepository.findAll().forEach(h -> listings.add(new Listing("HOMESTAY", h.getId(), h.gethomestayName(),
                h.getLocation(), h.getPricePerNight(), DestinationTagger.tagsFor(h.getLocation()))));
        flightRepository.findAll().forEach(f -> listings.add(new Listing("FLIGHT", f.getId(),
                f.getFlightName() + " to " + f.getTo(), f.getTo(), f.getPrice(), DestinationTagger.tagsFor(f.getTo()))));
        return listings;
    }

    private Listing lookupListing(String entityType, String entityId) {
        return switch (entityType) {
            case "HOTEL" -> hotelRepository.findById(entityId)
                    .map(h -> new Listing("HOTEL", h.getId(), h.gethotelName(), h.getLocation(),
                            h.getPricePerNight(), DestinationTagger.tagsFor(h.getLocation())))
                    .orElse(null);
            case "HOMESTAY" -> homestayRepository.findById(entityId)
                    .map(h -> new Listing("HOMESTAY", h.getId(), h.gethomestayName(), h.getLocation(),
                            h.getPricePerNight(), DestinationTagger.tagsFor(h.getLocation())))
                    .orElse(null);
            case "FLIGHT" -> flightRepository.findById(entityId)
                    .map(f -> new Listing("FLIGHT", f.getId(), f.getFlightName() + " to " + f.getTo(), f.getTo(),
                            f.getPrice(), DestinationTagger.tagsFor(f.getTo())))
                    .orElse(null);
            default -> null;
        };
    }
}