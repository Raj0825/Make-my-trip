package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.PushSubscription;
import com.makemytrip.makemytrip.repositories.PushSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/push")
@CrossOrigin(origins = "*")
public class PushSubscriptionController {

    @Autowired
    private PushSubscriptionRepository pushSubscriptionRepository;

    @Value("${vapid.public.key}")
    private String vapidPublicKey;

    // Frontend needs this to call PushManager.subscribe(...)
    @GetMapping("/vapid-public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", vapidPublicKey));
    }

    // body: { userId, endpoint, keys: { p256dh, auth } }
    @SuppressWarnings("unchecked")
    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, Object> body) {
        String userId = (String) body.get("userId");
        String endpoint = (String) body.get("endpoint");
        Map<String, String> keys = (Map<String, String>) body.get("keys");

        PushSubscription sub = pushSubscriptionRepository.findByUserId(userId).orElse(new PushSubscription());
        sub.setUserId(userId);
        sub.setEndpoint(endpoint);
        sub.setP256dhKey(keys.get("p256dh"));
        sub.setAuthKey(keys.get("auth"));
        pushSubscriptionRepository.save(sub);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestParam String userId) {
        pushSubscriptionRepository.deleteByUserId(userId);
        return ResponseEntity.ok().build();
    }
}