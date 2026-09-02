package com.makemytrip.makemytrip.controller;

import com.makemytrip.makemytrip.services.PromoCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/promo")
@CrossOrigin(origins = "*")
public class PromoCodeController {

    @Autowired
    private PromoCodeService promoCodeService;

    @GetMapping("/validate")
    public ResponseEntity<?> validate(@RequestParam String code, @RequestParam double subtotal) {
        try {
            double discount = promoCodeService.validateAndComputeDiscount(code, subtotal);
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("code", code.trim().toUpperCase());
            response.put("discount", discount);
            response.put("description", promoCodeService.findByCode(code).getDescription());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}