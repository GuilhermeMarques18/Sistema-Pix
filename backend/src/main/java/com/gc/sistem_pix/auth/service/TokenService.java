package com.gc.sistem_pix.auth.service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.gc.sistem_pix.user.entity.UserModel;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.expiration-hours:2}")
    private long expirationHours;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(UserModel user) {
        Instant now = Instant.now();
        Instant expiration = now.plus(expirationHours, ChronoUnit.HOURS);

        return Jwts.builder()
                .issuer("sistem-pix-api")
                .subject(user.getEmail())
                .claim("id", user.getId().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration.atZone(ZoneOffset.UTC).toInstant()))
                .signWith(signingKey())
                .compact();
    }

    public UUID validateTokenAndGetUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userId = claims.get("id", String.class);
            if (userId == null) {
                return null;
            }

            return UUID.fromString(userId);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
