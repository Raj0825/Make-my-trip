package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.PriceFreeze;
import com.makemytrip.makemytrip.repositories.PriceFreezeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PriceFreezeService {

    // Default freeze window; callers may request a shorter one but never a longer one,
    // so the "protection" the platform offers stays bounded and predictable.
    public static final long MAX_FREEZE_MINUTES = 24 * 60; // 24 hours

    @Autowired private PriceFreezeRepository priceFreezeRepository;
    @Autowired private DynamicPricingService dynamicPricingService;

    /** Locks in the current engine price for this user+item for the requested duration. */
    public PriceFreeze freeze(String userId, String entityType, String entityId, long requestedMinutes) {
        long minutes = Math.max(1, Math.min(requestedMinutes, MAX_FREEZE_MINUTES));

        // Replace any prior active freeze for the same item rather than stacking them.
        priceFreezeRepository.findFirstByUserIdAndEntityTypeAndEntityIdAndConsumedFalseOrderByCreatedAtDesc(
                userId, entityType, entityId
        ).ifPresent(prior -> {
            prior.setConsumed(true);
            priceFreezeRepository.save(prior);
        });

        double price = dynamicPricingService.getCurrentPrice(entityType, entityId);

        PriceFreeze freeze = new PriceFreeze();
        freeze.setUserId(userId);
        freeze.setEntityType(entityType);
        freeze.setEntityId(entityId);
        freeze.setFrozenPrice(price);
        freeze.setCreatedAt(System.currentTimeMillis());
        freeze.setExpiresAt(System.currentTimeMillis() + minutes * 60_000);
        return priceFreezeRepository.save(freeze);
    }

    /** The price a user should actually pay right now: their active freeze if any, else the live engine price. */
    public double getEffectivePrice(String userId, String entityType, String entityId) {
        Optional<PriceFreeze> active = getActiveFreeze(userId, entityType, entityId);
        return active.map(PriceFreeze::getFrozenPrice)
                .orElseGet(() -> dynamicPricingService.getCurrentPrice(entityType, entityId));
    }

    public Optional<PriceFreeze> getActiveFreeze(String userId, String entityType, String entityId) {
        return priceFreezeRepository
                .findFirstByUserIdAndEntityTypeAndEntityIdAndConsumedFalseOrderByCreatedAtDesc(userId, entityType, entityId)
                .filter(PriceFreeze::isActive);
    }

    /** Call this once the freeze has actually been used to complete a booking. */
    public void consume(PriceFreeze freeze) {
        freeze.setConsumed(true);
        priceFreezeRepository.save(freeze);
    }
}