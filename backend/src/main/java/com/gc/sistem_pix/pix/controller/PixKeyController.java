package com.gc.sistem_pix.pix.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gc.sistem_pix.infra.exception.ApiErrorResponse;
import com.gc.sistem_pix.pix.dto.CreatePixKeyRequest;
import com.gc.sistem_pix.pix.dto.PixKeyResponse;
import com.gc.sistem_pix.pix.dto.PixKeyValidationResponse;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.service.PixKeyService;
import com.gc.sistem_pix.user.entity.UserModel;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pix/keys")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PixKeyController {

    private final PixKeyService pixKeyService;

    @GetMapping
    @Operation(summary = "Lista todas as chaves Pix existentes", tags = {"Chaves Pix"})
    @ApiResponse(responseCode = "200", description = "Chaves Pix retornadas com sucesso")
    public ResponseEntity<List<PixKeyResponse>> findAll() {
        return ResponseEntity.ok(pixKeyService.findAll());
    }

    @GetMapping("/me")
    @Operation(summary = "Lista as próprias chaves Pix", tags = {"Chaves Pix"})
    @ApiResponse(responseCode = "200", description = "Chaves Pix retornadas com sucesso")
    public ResponseEntity<List<PixKeyResponse>> findMyKeys(
            @AuthenticationPrincipal UserModel authenticatedUser) {
        return ResponseEntity.ok(pixKeyService.findAllByUserId(authenticatedUser.getId()));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lista as chaves Pix de um usuário", tags = {"Chaves Pix"})
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Chaves Pix retornadas com sucesso"),
            @ApiResponse(responseCode = "404", description = "Conta bancária não encontrada")
    })
    public ResponseEntity<List<PixKeyResponse>> findAllByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(pixKeyService.findAllByUserId(userId));
    }

    @PostMapping
    @Operation(summary = "Associa uma chave Pix à conta do usuário autenticado", tags = {"Chaves Pix"})
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Chave Pix associada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Conta não encontrada"),
            @ApiResponse(responseCode = "409", description = "Chave Pix já cadastrada", content = @Content(schema = @Schema(implementation = ApiErrorResponse.class)))
    })
    public ResponseEntity<PixKeyResponse> create(
            @Valid @RequestBody CreatePixKeyRequest request,
            @AuthenticationPrincipal UserModel authenticatedUser) {
        return ResponseEntity.status(201)
                .body(pixKeyService.create(request, authenticatedUser));
    }

    @GetMapping("/validate")
    @Operation(summary = "Valida uma chave Pix e verifica se está cadastrada", tags = {"Chaves Pix"})
    @ApiResponse(responseCode = "200", description = "Resultado da validação")
    @ApiResponse(responseCode = "422", description = "Chave Pix inválida")
    public ResponseEntity<PixKeyValidationResponse> validate(
            @RequestParam PixKeyType tipo,
            @RequestParam String chave) {
        return ResponseEntity.ok(pixKeyService.validate(tipo, chave));
    }
}
