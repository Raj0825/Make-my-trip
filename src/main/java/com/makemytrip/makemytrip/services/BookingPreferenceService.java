package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.BookingPreference;
import com.makemytrip.makemytrip.repositories.BookingPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookingPreferenceService {

    @Autowired
    private BookingPreferenceRepository bookingPreferenceRepository;

    public BookingPreference getPreferences(String userId) {
        return bookingPreferenceRepository.findByUserId(userId).orElseGet(() -> {
            BookingPreference pref = new BookingPreference();
            pref.setUserId(userId);
            return pref;
        });
    }

    public BookingPreference savePreferences(String userId, String seatType, String seatClass, String roomTypeName) {
        BookingPreference pref = bookingPreferenceRepository.findByUserId(userId).orElseGet(() -> {
            BookingPreference p = new BookingPreference();
            p.setUserId(userId);
            return p;
        });
        if (seatType != null) pref.setPreferredSeatType(seatType);
        if (seatClass != null) pref.setPreferredSeatClass(seatClass);
        if (roomTypeName != null) pref.setPreferredRoomTypeName(roomTypeName);
        return bookingPreferenceRepository.save(pref);
    }
}