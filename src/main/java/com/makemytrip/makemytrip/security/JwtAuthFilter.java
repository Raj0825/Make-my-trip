package com.makemytrip.makemytrip.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    // Paths that must NOT be blocked even though they start with /admin
    // (the login endpoint itself, and the one-time bootstrap endpoint)
    private static final List<String> PUBLIC_ADMIN_PATHS = List.of(
            "/admin/login",
            "/admin/bootstrap"
    );

    private boolean isProtectedAdminPath(String path) {
        boolean isAdminArea = path.startsWith("/admin/") || path.startsWith("/reviews/admin/");
        boolean isPublicException = PUBLIC_ADMIN_PATHS.contains(path);
        return isAdminArea && !isPublicException;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (!isProtectedAdminPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Missing or invalid Authorization header");
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.isValidAdminToken(token)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Invalid, expired, or non-admin token");
            return;
        }

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                jwtUtil.parseToken(token).getSubject(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}