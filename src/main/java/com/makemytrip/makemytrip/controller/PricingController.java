package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.PriceFreeze;
import com.makemytrip.makemytrip.models.PriceHistoryEntry;
import com.makemytrip.makemytrip.models.PricingProfile;
import com.makemytrip.makemytrip.services.DynamicPricingService;
import com.makemytrip.makemytrip.services.PriceFreezeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pricing")
@CrossOrigin(origins = "*")
public class PricingController {

    @Autowired private DynamicPricingService dynamicPricingService;
    @Autowired private PriceFreezeService priceFreezeService;

    /** Current live price + a transparent breakdown of why it is what it is. */
    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<?> getCurrentPrice(@PathVariable String entityType, @PathVariable String entityId) {
        PricingProfile profile = dynamicPricingService.getOrCreateProfile(entityType.toUpperCase(), entityId);
        return ResponseEntity.ok(Map.of(
                "entityType", profile.getEntityType(),
                "entityId", profile.getEntityId(),
                "basePrice", profile.getBasePrice(),
                "currentPrice", profile.getCurrentPrice(),
                "multiplier", profile.getCurrentMultiplier(),
                "demandFactor", profile.getDemandFactor(),
                "seasonalFactor", profile.getSeasonalFactor(),
                "seasonalReason", profile.getSeasonalReason(),
                "lastUpdated", profile.getLastUpdated()
        ));
    }

    /** Price history points, oldest first - feeds the price-history graph on the item page. */
    @GetMapping("/{entityType}/{entityId}/history")
    public ResponseEntity<List<PriceHistoryEntry>> getHistory(@PathVariable String entityType, @PathVariable String entityId) {
        return ResponseEntity.ok(dynamicPricingService.getHistory(entityType.toUpperCase(), entityId));
    }

    /** Force an immediate recalculation (e.g. an admin "reprice now" button). */
    @PostMapping("/{entityType}/{entityId}/recalculate")
    public ResponseEntity<PricingProfile> recalculate(@PathVariable String entityType, @PathVariable String entityId) {
        return ResponseEntity.ok(dynamicPricingService.recalculate(entityType.toUpperCase(), entityId));
    }

    // -------------------- Price Freeze --------------------

    public record FreezeRequest(String userId, String entityType, String entityId, Long minutes) {}

    /** Lock in today's price for a limited period (default handled by the service, capped at 24h). */
    @PostMapping("/freeze")
    public ResponseEntity<?> createFreeze(@RequestBody FreezeRequest req) {
        long minutes = req.minutes() != null ? req.minutes() : 60;
        PriceFreeze freeze = priceFreezeService.freeze(req.userId(), req.entityType().toUpperCase(), req.entityId(), minutes);
        return ResponseEntity.ok(freeze);
    }

    /** What the user should actually be charged right now (their freeze if active, else the live price). */
    @GetMapping("/freeze/effective")
    public ResponseEntity<?> getEffectivePrice(@RequestParam String userId,
                                               @RequestParam String entityType,
                                               @RequestParam String entityId) {
        double price = priceFreezeService.getEffectivePrice(userId, entityType.toUpperCase(), entityId);
        var active = priceFreezeService.getActiveFreeze(userId, entityType.toUpperCase(), entityId);
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("effectivePrice", price);
        body.put("frozen", active.isPresent());
        body.put("expiresAt", active.map(PriceFreeze::getExpiresAt).orElse(null));
        return ResponseEntity.ok(body);
    }
}