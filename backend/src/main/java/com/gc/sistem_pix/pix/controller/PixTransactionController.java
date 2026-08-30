package com.gc.sistem_pix.pix.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gc.sistem_pix.pix.dto.PixTransactionRequest;
import com.gc.sistem_pix.pix.dto.PixTransactionResponse;
import com.gc.sistem_pix.pix.service.PixTransactionService;
import com.gc.sistem_pix.user.entity.UserModel;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pix/transactions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PixTransactionController {

    private final PixTransactionService pixTransactionService;

    @GetMapping
    @Operation(summary = "Lista todas as transações Pix realizadas", tags = {"Transações Pix"})
    @ApiResponse(responseCode = "200", description = "Transações retornadas com sucesso")
    public ResponseEntity<List<PixTransactionResponse>> findAll() {
        return ResponseEntity.ok(pixTransactionService.findAll());
    }

    @GetMapping("/me")
    @Operation(summary = "Lista as próprias transações Pix", tags = {"Transações Pix"})
    @ApiResponse(responseCode = "200", description = "Transações retornadas com sucesso")
    public ResponseEntity<List<PixTransactionResponse>> findMyTransactions(
            @AuthenticationPrincipal UserModel authenticatedUser) {
        return ResponseEntity.ok(pixTransactionService.findAllByUserId(authenticatedUser.getId()));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lista as transações Pix de um usuário", tags = {"Transações Pix"})
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transações retornadas com sucesso"),
            @ApiResponse(responseCode = "404", description = "Conta bancária não encontrada")
    })
    public ResponseEntity<List<PixTransactionResponse>> findAllByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(pixTransactionService.findAllByUserId(userId));
    }

    @PostMapping
    @Operation(
            summary = "Realiza uma transferência Pix",
            description = "Debita a conta do usuário autenticado e credita a conta associada à chave Pix informada.",
            tags = {"Transações Pix"})
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transação criada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "422", description = "Transação Pix inválida")
    })
    public ResponseEntity<PixTransactionResponse> create(
            @Valid @RequestBody PixTransactionRequest request,
            @AuthenticationPrincipal UserModel authenticatedUser) {
        PixTransactionResponse response = pixTransactionService.create(request, authenticatedUser);

        URI location = URI.create("/api/pix/transactions/" + response.idTransacao());

        return ResponseEntity.created(location).body(response);
    }
}
