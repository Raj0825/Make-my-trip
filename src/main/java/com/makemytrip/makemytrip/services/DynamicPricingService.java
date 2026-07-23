package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.*;
import com.makemytrip.makemytrip.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.MonthDay;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The Dynamic Pricing Engine.
 *
 * Design goals (matching the product requirements):
 *  - Prices react to demand (occupancy/seat-fill ratio) and to seasonal/peak
 *    windows (e.g. +20% around major holidays).
 *  - Every price is recomputed from a fixed "basePrice" anchor rather than by
 *    compounding on the last price, so changes stay bounded, transparent, and
 *    predictable rather than drifting arbitrarily over time.
 *  - Runs on a schedule (real-time-ish engine tick) AND can be triggered
 *    on-demand (e.g. right after a booking changes availability).
 *  - Every recalculation is (a) written back to the entity's own price field,
 *    (b) appended to price_history for the price-history graph, and
 *    (c) broadcast over WebSocket so all connected clients update instantly.
 */
@Service
public class DynamicPricingService {

    public static final String FLIGHT = "FLIGHT";
    public static final String HOTEL = "HOTEL";
    public static final String TRAIN = "TRAIN";
    public static final String BUS = "BUS";
    public static final String CAB = "CAB";
    public static final String HOMESTAY = "HOMESTAY";

    // Bounds keep adjustments predictable: never below 80% or above double the base price.
    private static final double MIN_MULTIPLIER = 0.8;
    private static final double MAX_MULTIPLIER = 2.0;

    // Peak/holiday windows -> extra multiplier bump. MonthDay ignores year so this repeats annually.
    // (+0.20 == the "+20% during holidays / peak travel periods" requirement)
    private static final Map<String, double[]> PEAK_WINDOWS = Map.ofEntries(
            // name -> {startMonth, startDay, endMonth, endDay, bump}
            entry("New Year", 12, 24, 1, 2, 0.20),
            entry("Summer holidays", 5, 15, 6, 30, 0.15),
            entry("Diwali season", 10, 15, 11, 15, 0.20),
            entry("Christmas", 12, 20, 12, 31, 0.20)
    );

    private static Map.Entry<String, double[]> entry(String name, int sm, int sd, int em, int ed, double bump) {
        return Map.entry(name, new double[]{sm, sd, em, ed, bump});
    }

    @Autowired private PricingProfileRepository pricingProfileRepository;
    @Autowired private PriceHistoryRepository priceHistoryRepository;

    @Autowired private FlightRepository flightRepository;
    @Autowired private HotelRepository hotelRepository;
    @Autowired private TrainRepository trainRepository;
    @Autowired private BusRepository busRepository;
    @Autowired private CabRepository cabRepository;
    @Autowired private HomestayRepository homestayRepository;

    @Autowired private SimpMessagingTemplate messagingTemplate;

    // ---------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------

    /** Returns the live engine price for an item, initializing its profile on first access. */
    public double getCurrentPrice(String entityType, String entityId) {
        return getOrCreateProfile(entityType, entityId).getCurrentPrice();
    }

    public PricingProfile getOrCreateProfile(String entityType, String entityId) {
        return pricingProfileRepository.findByEntityTypeAndEntityId(entityType, entityId)
                .orElseGet(() -> initializeAndRecalculate(entityType, entityId));
    }

    public List<PriceHistoryEntry> getHistory(String entityType, String entityId) {
        return priceHistoryRepository.findByEntityTypeAndEntityIdOrderByTimestampAsc(entityType, entityId);
    }

    /** Force a recalculation right now (e.g. call this after a booking changes availability). */
    public PricingProfile recalculate(String entityType, String entityId) {
        Optional<PricingProfile> existing = pricingProfileRepository.findByEntityTypeAndEntityId(entityType, entityId);
        if (existing.isEmpty()) {
            return initializeAndRecalculate(entityType, entityId);
        }
        return applyRecalculation(existing.get());
    }

    /**
     * Call this whenever an admin manually edits an item's price directly (outside a booking).
     * A manual edit is treated as re-anchoring the item: the new admin price becomes the fresh
     * "basePrice", so the engine's demand/seasonal adjustments apply on top of it going forward
     * instead of silently reverting to whatever the old anchor used to be.
     */
    public PricingProfile resetBasePrice(String entityType, String entityId, double newBasePrice) {
        PricingProfile profile = pricingProfileRepository.findByEntityTypeAndEntityId(entityType, entityId)
                .orElseGet(() -> {
                    PricingProfile p = new PricingProfile();
                    p.setEntityType(entityType);
                    p.setEntityId(entityId);
                    p.setTotalCapacity(1);
                    return p;
                });
        profile.setBasePrice(newBasePrice);
        profile.setCurrentPrice(newBasePrice);
        profile.setCurrentMultiplier(1.0);
        profile.setLastUpdated(System.currentTimeMillis());
        profile = pricingProfileRepository.save(profile);

        PricingProfile recalculated = applyRecalculation(profile);

        PriceHistoryEntry entry = new PriceHistoryEntry();
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setPrice(recalculated.getCurrentPrice());
        entry.setMultiplier(recalculated.getCurrentMultiplier());
        entry.setDemandFactor(recalculated.getDemandFactor());
        entry.setSeasonalFactor(recalculated.getSeasonalFactor());
        entry.setReason("Manual price update by admin");
        entry.setTimestamp(recalculated.getLastUpdated());
        priceHistoryRepository.save(entry);
        messagingTemplate.convertAndSend(
                "/topic/prices/" + entityType + "/" + entityId,
                entry
        );

        return recalculated;
    }

    /** Engine tick: re-prices every known item. Runs every 5 minutes. */
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void engineTick() {
        for (PricingProfile profile : pricingProfileRepository.findAll()) {
            try {
                applyRecalculation(profile);
            } catch (Exception e) {
                // Never let one bad item stop the whole engine tick.
                System.err.println("Pricing engine failed for " + profile.getEntityType() + "/" + profile.getEntityId() + ": " + e.getMessage());
            }
        }
    }

    // ---------------------------------------------------------------------
    // Internals
    // ---------------------------------------------------------------------

    private PricingProfile initializeAndRecalculate(String entityType, String entityId) {
        EntitySnapshot snap = readEntity(entityType, entityId);
        PricingProfile profile = new PricingProfile();
        profile.setEntityType(entityType);
        profile.setEntityId(entityId);
        profile.setBasePrice(snap.price);
        profile.setTotalCapacity(Math.max(snap.available, 1));
        profile.setCurrentPrice(snap.price);
        profile.setCurrentMultiplier(1.0);
        profile.setLastUpdated(System.currentTimeMillis());
        profile = pricingProfileRepository.save(profile);
        return applyRecalculation(profile);
    }

    private PricingProfile applyRecalculation(PricingProfile profile) {
        EntitySnapshot snap = readEntity(profile.getEntityType(), profile.getEntityId());

        // Capacity is self-learned: we never had a "total seats at creation" field on the
        // original models, so we treat the highest availability we've ever observed as the
        // capacity ceiling. This stabilizes quickly and avoids a schema migration.
        if (snap.available > profile.getTotalCapacity()) {
            profile.setTotalCapacity(snap.available);
        }

        double occupancy = 1.0 - ((double) snap.available / Math.max(profile.getTotalCapacity(), 1));
        occupancy = clamp(occupancy, 0.0, 1.0);

        // Demand factor: up to +30% as occupancy approaches full.
        double demandFactor = occupancy * 0.30;

        SeasonalResult seasonal = seasonalFactorFor(LocalDate.now());

        double multiplier = 1.0 + demandFactor + seasonal.bump;
        multiplier = clamp(multiplier, MIN_MULTIPLIER, MAX_MULTIPLIER);

        double newPrice = round2(profile.getBasePrice() * multiplier);

        boolean changed = Math.abs(newPrice - profile.getCurrentPrice()) > 0.005;

        profile.setDemandFactor(round2(demandFactor));
        profile.setSeasonalFactor(round2(seasonal.bump));
        profile.setSeasonalReason(seasonal.reason);
        profile.setCurrentMultiplier(round2(multiplier));
        profile.setCurrentPrice(newPrice);
        profile.setLastUpdated(System.currentTimeMillis());
        pricingProfileRepository.save(profile);

        writeEntityPrice(profile.getEntityType(), profile.getEntityId(), newPrice);

        if (changed) {
            String reason = buildReason(demandFactor, seasonal);
            PriceHistoryEntry entry = new PriceHistoryEntry();
            entry.setEntityType(profile.getEntityType());
            entry.setEntityId(profile.getEntityId());
            entry.setPrice(newPrice);
            entry.setMultiplier(profile.getCurrentMultiplier());
            entry.setDemandFactor(profile.getDemandFactor());
            entry.setSeasonalFactor(profile.getSeasonalFactor());
            entry.setReason(reason);
            entry.setTimestamp(profile.getLastUpdated());
            priceHistoryRepository.save(entry);

            // Real-time push to every client watching this item's page.
            messagingTemplate.convertAndSend(
                    "/topic/prices/" + profile.getEntityType() + "/" + profile.getEntityId(),
                    entry
            );
        }

        return profile;
    }

    private String buildReason(double demandFactor, SeasonalResult seasonal) {
        StringBuilder sb = new StringBuilder();
        if (!seasonal.reason.isEmpty()) sb.append(seasonal.reason);
        if (demandFactor > 0.20) sb.append(sb.length() > 0 ? " + " : "").append("very high demand");
        else if (demandFactor > 0.10) sb.append(sb.length() > 0 ? " + " : "").append("elevated demand");
        return sb.length() == 0 ? "Standard pricing" : sb.toString();
    }

    private record SeasonalResult(double bump, String reason) {}

    private SeasonalResult seasonalFactorFor(LocalDate date) {
        MonthDay today = MonthDay.from(date);
        double best = 0.0;
        String reason = "";
        for (Map.Entry<String, double[]> e : PEAK_WINDOWS.entrySet()) {
            double[] w = e.getValue();
            MonthDay start = MonthDay.of((int) w[0], (int) w[1]);
            MonthDay end = MonthDay.of((int) w[2], (int) w[3]);
            boolean inWindow = start.isBefore(end)
                    ? (!today.isBefore(start) && !today.isAfter(end))
                    : (!today.isBefore(start) || !today.isAfter(end)); // window wraps around year-end
            if (inWindow && w[4] > best) {
                best = w[4];
                reason = "Peak season (" + e.getKey() + ")";
            }
        }
        return new SeasonalResult(best, reason);
    }

    private static double clamp(double v, double min, double max) {
        return Math.max(min, Math.min(max, v));
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    // ---------------------------------------------------------------------
    // Per-entity-type read/write bridge (models differ slightly in field names)
    // ---------------------------------------------------------------------

    private record EntitySnapshot(double price, int available) {}

    private EntitySnapshot readEntity(String entityType, String entityId) {
        switch (entityType) {
            case FLIGHT -> {
                Flight f = flightRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Flight not found"));
                return new EntitySnapshot(f.getPrice(), f.getAvailableSeats());
            }
            case HOTEL -> {
                Hotel h = hotelRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Hotel not found"));
                return new EntitySnapshot(h.getPricePerNight(), h.getAvailableRooms());
            }
            case TRAIN -> {
                Train t = trainRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Train not found"));
                return new EntitySnapshot(t.getPrice(), t.getAvailableSeats());
            }
            case BUS -> {
                Bus b = busRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Bus not found"));
                return new EntitySnapshot(b.getPrice(), b.getAvailableSeats());
            }
            case CAB -> {
                Cab c = cabRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Cab not found"));
                return new EntitySnapshot(c.getPrice(), c.getAvailableSeats());
            }
            case HOMESTAY -> {
                Homestay h = homestayRepository.findById(entityId).orElseThrow(() -> new RuntimeException("Homestay not found"));
                return new EntitySnapshot(h.getPricePerNight(), h.getAvailableRooms());
            }
            default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
        }
    }

    private void writeEntityPrice(String entityType, String entityId, double price) {
        switch (entityType) {
            case FLIGHT -> flightRepository.findById(entityId).ifPresent(f -> { f.setPrice(price); flightRepository.save(f); });
            case HOTEL -> hotelRepository.findById(entityId).ifPresent(h -> { h.setPricePerNight(price); hotelRepository.save(h); });
            case TRAIN -> trainRepository.findById(entityId).ifPresent(t -> { t.setPrice(price); trainRepository.save(t); });
            case BUS -> busRepository.findById(entityId).ifPresent(b -> { b.setPrice(price); busRepository.save(b); });
            case CAB -> cabRepository.findById(entityId).ifPresent(c -> { c.setPrice(price); cabRepository.save(c); });
            case HOMESTAY -> homestayRepository.findById(entityId).ifPresent(h -> { h.setPricePerNight(price); homestayRepository.save(h); });
            default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
        }
    }
}