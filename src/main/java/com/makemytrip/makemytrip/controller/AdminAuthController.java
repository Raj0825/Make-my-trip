package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.security.JwtUtil;
import com.makemytrip.makemytrip.services.UserServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminAuthController {

    @Autowired
    private UserServices userServices;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${admin.bootstrap.secret}")
    private String bootstrapSecret;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Users user = userServices.login(email, password);
        if (user == null) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body("This account does not have admin access");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "role", user.getRole()
        ));
    }

    @PostMapping("/bootstrap")
    public ResponseEntity<?> bootstrap(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String secret = body.get("secret");

        if (secret == null || !secret.equals(bootstrapSecret)) {
            return ResponseEntity.status(403).body("Invalid bootstrap secret");
        }

        Users user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body("No user found with that email — sign up first");
        }

        user.setRole("ADMIN");
        userRepository.save(user);
        return ResponseEntity.ok("User " + email + " is now an admin. You can log in at /admin/login.");
    }
}