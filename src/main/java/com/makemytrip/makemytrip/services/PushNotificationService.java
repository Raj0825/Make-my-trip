package com.makemytrip.makemytrip.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.makemytrip.makemytrip.models.PushSubscription;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.HashMap;
import java.util.Map;

@Service
public class PushNotificationService {

    @Value("${vapid.public.key}")
    private String publicKey;

    @Value("${vapid.private.key}")
    private String privateKey;

    @Value("${vapid.subject}")
    private String subject;

    private PushService pushService;

    @PostConstruct
    public void init() throws Exception {
        Security.addProvider(new BouncyCastleProvider());
        pushService = new PushService();
        pushService.setPublicKey(publicKey);
        pushService.setPrivateKey(privateKey);
        pushService.setSubject(subject);
    }

    /**
     * Sends a browser push notification to one subscriber.
     * Failures are swallowed (logged) so one dead subscription doesn't
     * break the scheduled job updating every tracked flight.
     */
    public void send(PushSubscription sub, String title, String body, Map<String, Object> data) {
        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("title", title);
            payloadMap.put("body", body);
            if (data != null) payloadMap.put("data", data);

            String payload = new ObjectMapper().writeValueAsString(payloadMap);

            Notification notification = new Notification(
                    sub.getEndpoint(),
                    sub.getP256dhKey(),
                    sub.getAuthKey(),
                    payload
            );
            pushService.send(notification);
        } catch (Exception e) {
            System.out.println("Push notification failed for user " + sub.getUserId() + ": " + e.getMessage());
        }
    }
}