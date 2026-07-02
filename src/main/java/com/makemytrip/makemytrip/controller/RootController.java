package com.makemytrip.makemytrip.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class RootController {
    @GetMapping("/")
            public String home() {
        return "Welcome to MakeMyTrip!";
    }
}
