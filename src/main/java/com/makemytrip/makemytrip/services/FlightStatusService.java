package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.FlightStatus;
import com.makemytrip.makemytrip.models.FlightTracking;
import com.makemytrip.makemytrip.models.PushSubscription;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.FlightStatusRepository;
import com.makemytrip.makemytrip.repositories.FlightTrackingRepository;
import com.makemytrip.makemytrip.repositories.PushSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class FlightStatusService {

    @Autowired private FlightStatusRepository flightStatusRepository;
    @Autowired private FlightTrackingRepository flightTrackingRepository;
    @Autowired private PushSubscriptionRepository pushSubscriptionRepository;
    @Autowired private FlightRepository flightRepository;
    @Autowired private PushNotificationService pushNotificationService;

    private static final List<String> DELAY_REASONS = List.of(
            "Air traffic congestion at destination airport",
            "Late arrival of aircraft from previous flight",
            "Adverse weather conditions en route",
            "Technical inspection required before departure",
            "Crew scheduling adjustment"
    );

    private final Random random = new Random();

    public FlightStatus getOrCreateStatus(String flightId) {
        return flightStatusRepository.findByFlightId(flightId).orElseGet(() -> {
            FlightStatus status = new FlightStatus();
            status.setFlightId(flightId);
            status.setStatus("ON_TIME");
            flightRepository.findById(flightId).ifPresent(f -> status.setEstimatedArrivalTime(f.getArrivalTime()));
            FlightStatus.StatusEvent event = new FlightStatus.StatusEvent();
            event.setStatus("ON_TIME");
            event.setMessage("Flight is on time.");
            status.getHistory().add(event);
            return flightStatusRepository.save(status);
        });
    }

    public FlightTracking track(String userId, String flightId) {
        getOrCreateStatus(flightId);
        return flightTrackingRepository.findByUserIdAndFlightId(userId, flightId).orElseGet(() -> {
            FlightTracking tracking = new FlightTracking();
            tracking.setUserId(userId);
            tracking.setFlightId(flightId);
            return flightTrackingRepository.save(tracking);
        });
    }

    public void untrack(String userId, String flightId) {
        flightTrackingRepository.deleteByUserIdAndFlightId(userId, flightId);
    }

    public List<Map<String, Object>> getTrackedFlightsWithStatus(String userId) {
        List<FlightTracking> trackings = flightTrackingRepository.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (FlightTracking tracking : trackings) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("flightId", tracking.getFlightId());
            flightRepository.findById(tracking.getFlightId()).ifPresent(f -> entry.put("flight", f));
            flightStatusRepository.findByFlightId(tracking.getFlightId()).ifPresent(s -> entry.put("status", s));
            result.add(entry);
        }
        return result;
    }

    @Scheduled(fixedRate = 20 * 1000)
    public void simulateStatusUpdates() {
        Set<String> trackedFlightIds = new HashSet<>();
        flightTrackingRepository.findAll().forEach(t -> trackedFlightIds.add(t.getFlightId()));

        for (String flightId : trackedFlightIds) {
            if (random.nextDouble() > 0.35) continue;

            FlightStatus status = getOrCreateStatus(flightId);
            if (isTerminal(status.getStatus())) continue;

            String nextStatus = pickNextStatus(status.getStatus());
            String message = applyStatusChange(status, nextStatus);

            status.setLastUpdated(Instant.now());
            FlightStatus.StatusEvent event = new FlightStatus.StatusEvent();
            event.setStatus(nextStatus);
            event.setMessage(message);
            status.getHistory().add(event);
            flightStatusRepository.save(status);

            notifySubscribers(flightId, nextStatus, message);
        }
    }

    private boolean isTerminal(String status) {
        return "LANDED".equals(status) || "CANCELLED".equals(status);
    }

    private String pickNextStatus(String current) {
        return switch (current) {
            case "ON_TIME" -> weightedPick(List.of("BOARDING", "DELAYED", "ON_TIME"), List.of(0.4, 0.3, 0.3));
            case "DELAYED" -> weightedPick(List.of("BOARDING", "DELAYED"), List.of(0.5, 0.5));
            case "BOARDING" -> "DEPARTED";
            case "DEPARTED" -> "IN_AIR";
            case "IN_AIR" -> "LANDED";
            default -> current;
        };
    }

    private String weightedPick(List<String> options, List<Double> weights) {
        double r = random.nextDouble();
        double cumulative = 0;
        for (int i = 0; i < options.size(); i++) {
            cumulative += weights.get(i);
            if (r <= cumulative) return options.get(i);
        }
        return options.get(options.size() - 1);
    }

    private String applyStatusChange(FlightStatus status, String nextStatus) {
        status.setStatus(nextStatus);

        switch (nextStatus) {
            case "DELAYED" -> {
                int delay = 15 + random.nextInt(6) * 15;
                String reason = DELAY_REASONS.get(random.nextInt(DELAY_REASONS.size()));
                status.setDelayMinutes(delay);
                status.setDelayReason(reason);
                return "Delayed by " + (delay >= 60 ? (delay / 60) + "h " + (delay % 60) + "m" : delay + "m")
                        + " — " + reason;
            }
            case "BOARDING" -> {
                status.setDelayMinutes(null);
                status.setDelayReason(null);
                return "Boarding has started.";
            }
            case "DEPARTED" -> {
                return "Flight has departed.";
            }
            case "IN_AIR" -> {
                return "Flight is now in the air.";
            }
            case "LANDED" -> {
                return "Flight has landed.";
            }
            default -> {
                return "Flight is on time.";
            }
        }
    }

    private void notifySubscribers(String flightId, String status, String message) {
        List<FlightTracking> trackers = flightTrackingRepository.findByFlightId(flightId);
        String flightLabel = flightRepository.findById(flightId)
                .map(f -> f.getFlightName() + " (" + f.getFrom() + " → " + f.getTo() + ")")
                .orElse("Your flight");

        for (FlightTracking tracker : trackers) {
            pushSubscriptionRepository.findByUserId(tracker.getUserId()).ifPresent(sub ->
                    pushNotificationService.send(
                            sub,
                            flightLabel,
                            message,
                            Map.of("flightId", flightId, "status", status)
                    )
            );
        }
    }
}