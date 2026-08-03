package com.makemytrip.makemytrip.util;

import java.util.*;

/**
 * Since hotels/homestays/flights only store a free-text location (no explicit
 * "category" field), this heuristically tags known destinations with travel-style
 * categories (beach, hill station, heritage, etc). This is the content-based signal
 * the recommendation engine uses to explain *why* it's suggesting something -
 * e.g. "You liked beaches! Try Goa."
 *
 * Unrecognized locations fall back to a generic "City" tag rather than being
 * excluded, so recommendations still work for admin-entered places we don't know.
 */
public class DestinationTagger {

    public static final String BEACH = "beach";
    public static final String HILL_STATION = "hill station";
    public static final String HERITAGE = "heritage";
    public static final String METRO_CITY = "metro city";
    public static final String WILDLIFE = "wildlife";
    public static final String ADVENTURE = "adventure";
    public static final String BACKWATERS = "backwaters";

    private static final Map<String, List<String>> KNOWN_TAGS = new HashMap<>();
    static {
        put(BEACH, "goa", "north goa", "south goa", "pondicherry", "puri", "gokarna", "varkala", "diu", "andaman", "lakshadweep");
        put(HILL_STATION, "manali", "shimla", "mussoorie", "darjeeling", "ooty", "nainital", "coorg", "munnar", "kodaikanal", "gangtok", "leh", "ladakh", "kasauli", "dharamshala", "mcleodganj");
        put(HERITAGE, "delhi", "new delhi", "agra", "jaipur", "udaipur", "jodhpur", "hampi", "khajuraho", "varanasi", "mysore", "mysuru", "gwalior", "orchha");
        put(METRO_CITY, "mumbai", "bengaluru", "bangalore", "chennai", "hyderabad", "kolkata", "pune", "ahmedabad", "solapur", "kolhapur", "surat", "nagpur");
        put(WILDLIFE, "ranthambore", "jim corbett", "corbett", "kanha", "bandhavgarh", "kaziranga", "gir", "sundarbans");
        put(ADVENTURE, "rishikesh", "auli", "spiti", "bir billing", "manali", "leh", "ladakh");
        put(BACKWATERS, "kerala", "alleppey", "alappuzha", "kumarakom", "kochi", "cochin");
    }

    private static void put(String tag, String... locations) {
        for (String loc : locations) {
            KNOWN_TAGS.computeIfAbsent(loc, k -> new ArrayList<>()).add(tag);
        }
    }

    /** Returns the travel-style tags that best describe a free-text location string. */
    public static List<String> tagsFor(String location) {
        if (location == null || location.isBlank()) return List.of(METRO_CITY);
        String normalized = location.toLowerCase().trim();

        Set<String> matched = new LinkedHashSet<>();
        for (Map.Entry<String, List<String>> entry : KNOWN_TAGS.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                matched.addAll(entry.getValue());
            }
        }
        return matched.isEmpty() ? List.of(METRO_CITY) : new ArrayList<>(matched);
    }
}