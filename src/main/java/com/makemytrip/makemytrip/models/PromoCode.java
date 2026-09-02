package com.makemytrip.makemytrip.models;

public class PromoCode {
    private String code;
    private String description;
    private String type;   // "PERCENT" or "FLAT"
    private double value;  // percent (0-100) or flat rupee amount
    private double minAmount;   // minimum booking subtotal required
    private double maxDiscount; // cap for PERCENT type, 0 = no cap

    public PromoCode(String code, String description, String type, double value, double minAmount, double maxDiscount) {
        this.code = code;
        this.description = description;
        this.type = type;
        this.value = value;
        this.minAmount = minAmount;
        this.maxDiscount = maxDiscount;
    }

    public String getCode() { return code; }
    public String getDescription() { return description; }
    public String getType() { return type; }
    public double getValue() { return value; }
    public double getMinAmount() { return minAmount; }
    public double getMaxDiscount() { return maxDiscount; }

    public double computeDiscount(double subtotal) {
        if (subtotal < minAmount) return 0;
        double discount;
        if ("PERCENT".equals(type)) {
            discount = subtotal * (value / 100.0);
            if (maxDiscount > 0) discount = Math.min(discount, maxDiscount);
        } else {
            discount = value;
        }
        return Math.min(discount, subtotal);
    }
}