package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getWishlist(@PathVariable String userId) {
        Optional<Users> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        return ResponseEntity.ok(userOptional.get().getFavorites());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@RequestParam String userId, @RequestParam String type, @RequestParam String entityId) {
        Optional<Users> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        Users user = userOptional.get();
        boolean alreadySaved = user.getFavorites().stream()
                .anyMatch(f -> f.getType().equals(type) && f.getEntityId().equals(entityId));
        if (!alreadySaved) {
            Users.Favorite favorite = new Users.Favorite();
            favorite.setType(type);
            favorite.setEntityId(entityId);
            favorite.setAddedAt(Instant.now().toString());
            user.getFavorites().add(favorite);
            userRepository.save(user);
        }
        return ResponseEntity.ok(user.getFavorites());
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeFromWishlist(@RequestParam String userId, @RequestParam String type, @RequestParam String entityId) {
        Optional<Users> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        Users user = userOptional.get();
        List<Users.Favorite> filtered = user.getFavorites().stream()
                .filter(f -> !(f.getType().equals(type) && f.getEntityId().equals(entityId)))
                .collect(Collectors.toList());
        user.setFavorites(filtered);
        userRepository.save(user);
        return ResponseEntity.ok(user.getFavorites());
    }
}