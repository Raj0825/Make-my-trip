package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.PromoCode;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class PromoCodeService {

    // A small hardcoded catalog for now — swap for a repository-backed
    // collection if promo codes need to be managed from the admin panel later.
    private final Map<String, PromoCode> codes = new LinkedHashMap<>();

    public PromoCodeService() {
        codes.put("FIRST10", new PromoCode("FIRST10", "10% off your first booking", "PERCENT", 10, 0, 1000));
        codes.put("SAVE500", new PromoCode("SAVE500", "Flat ₹500 off on bookings above ₹3000", "FLAT", 500, 3000, 0));
        codes.put("WELCOME50", new PromoCode("WELCOME50", "Flat ₹50 off, no minimum", "FLAT", 50, 0, 0));
        codes.put("HOLIDAY15", new PromoCode("HOLIDAY15", "15% off on bookings above ₹10000", "PERCENT", 15, 10000, 3000));
    }

    public PromoCode findByCode(String code) {
        if (code == null) return null;
        return codes.get(code.trim().toUpperCase());
    }

    /** Returns the discount amount for a given code + subtotal, or throws if invalid/not applicable. */
    public double validateAndComputeDiscount(String code, double subtotal) {
        PromoCode promo = findByCode(code);
        if (promo == null) {
            throw new RuntimeException("Invalid promo code");
        }
        double discount = promo.computeDiscount(subtotal);
        if (discount <= 0) {
            throw new RuntimeException("This code requires a minimum booking amount of ₹" + (int) promo.getMinAmount());
        }
        return discount;
    }
}