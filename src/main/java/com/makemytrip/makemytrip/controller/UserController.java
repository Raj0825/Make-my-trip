package com.makemytrip.makemytrip.controller;
import com.makemytrip.makemytrip.models.Users;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.makemytrip.makemytrip.services.UserServices;
import com.makemytrip.makemytrip.repositories.UserRepository;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserServices userServices;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public Users login(@RequestParam String email, @RequestParam String password){
        return userServices.login(email,password);
    }
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Users user) {
        try {
            return ResponseEntity.ok(userServices.signup(user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/email")
    public ResponseEntity<Users> getuserbyemail(@RequestParam String email){
        Users user = userServices.getUserByEmail(email);
        if(user != null){
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }
    @PostMapping("/edit")
    public Users editprofile(@RequestParam String id ,@RequestBody Users updatedUser){
        return userServices.editprofile(id,updatedUser);
    }

    @GetMapping("/loyalty")
    public ResponseEntity<?> getLoyalty(@RequestParam String id) {
        return userRepository.findById(id)
            .map(u -> (ResponseEntity<?>) ResponseEntity.ok(Map.of(
                "points",   u.getLoyaltyPoints(),
                "earned",   u.getLoyaltyEarned(),
                "history",  u.getLoyaltyHistory() != null ? u.getLoyaltyHistory() : java.util.List.of()
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/loyalty/redeem")
    public ResponseEntity<?> redeemPoints(@RequestParam String id, @RequestParam int points) {
        return userRepository.findById(id).map(u -> {
            int available = u.getLoyaltyPoints();
            if (points <= 0 || points > available) {
                return ResponseEntity.badRequest().body("Insufficient loyalty points");
            }
            u.setLoyaltyPoints(available - points);
            Users.LoyaltyEvent event = new Users.LoyaltyEvent();
            event.setType("REDEEMED");
            event.setPoints(-points);
            event.setDescription("Points redeemed at checkout");
            event.setDate(Instant.now().toString());
            if (u.getLoyaltyHistory() == null) u.setLoyaltyHistory(new java.util.ArrayList<>());
            u.getLoyaltyHistory().add(0, event);
            Users saved = userRepository.save(u);
            return (ResponseEntity<?>) ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
