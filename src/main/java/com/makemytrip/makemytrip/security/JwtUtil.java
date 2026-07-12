package com.makemytrip.makemytrip.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    // 12 hours
    private static final long EXPIRATION_MS = 1000L * 60 * 60 * 12;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String userId, String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRATION_MS);
        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isValidAdminToken(String token) {
        try {
            Claims claims = parseToken(token);
            return "ADMIN".equals(claims.get("role", String.class));
        } catch (Exception e) {
            return false;
        }
    }
}