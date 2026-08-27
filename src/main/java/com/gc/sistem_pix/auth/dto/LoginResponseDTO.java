package auth.dto;

public record LoginResponseDTO(String token, String tokenType) {
    public LoginResponseDTO(String token) {
        this(token, "Bearer");
    }
}
