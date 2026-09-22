package com.gc.sistem_pix.auth.dto;

public record LoginResponseDTO(String token, String tokenType) {
    public LoginResponseDTO(String token) {
        this(token, "Bearer");
    }
}
