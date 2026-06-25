package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.makemytrip.makemytrip.models.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String email,
                                        @RequestParam String password) {

        if (userService.login(email, password) != null) {
            return ResponseEntity.ok("Login successful");
        }

        return ResponseEntity.badRequest().body("Invalid email or password");
    }

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody User user) {
        return ResponseEntity.ok(userService.signup(user));
    }

}