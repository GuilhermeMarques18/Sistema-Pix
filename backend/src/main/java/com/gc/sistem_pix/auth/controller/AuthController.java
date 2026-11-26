package com.gc.sistem_pix.auth.controller;

import com.gc.sistem_pix.auth.dto.LoginRequestDTO;
import com.gc.sistem_pix.auth.dto.LoginResponseDTO;
import com.gc.sistem_pix.auth.service.TokenService;
import com.gc.sistem_pix.activity.service.UserActivityEventService;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.repository.UserRepository;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UserRepository users;
    private final UserActivityEventService activityEvents;

    @PostMapping("/login")
    @Operation(summary = "Realiza login", description = "Autentica um usuário e retorna um token JWT.", tags = {"Autenticação"})
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    })
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        var authToken = new UsernamePasswordAuthenticationToken(dto.email(), dto.password());
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(authToken);
        } catch (AuthenticationException exception) {
            users.findByEmailIgnoreCase(dto.email()).ifPresent(user -> activityEvents.recordLogin(user, false));
            throw exception;
        }

        UserModel user = (UserModel) authentication.getPrincipal();
        String token = tokenService.generateToken(user);
        activityEvents.recordLogin(user, true);

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }
}
