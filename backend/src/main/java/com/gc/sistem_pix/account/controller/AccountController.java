package com.gc.sistem_pix.account.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gc.sistem_pix.account.dto.AccountResponseDTO;
import com.gc.sistem_pix.account.dto.AccountUpdateDTO;
import com.gc.sistem_pix.account.service.AccountService;
import com.gc.sistem_pix.user.entity.UserModel;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    @Operation(summary = "Lista todas as contas bancárias", tags = {"Contas bancárias"})
    @ApiResponse(responseCode = "200", description = "Contas retornadas com sucesso")
    public ResponseEntity<List<AccountResponseDTO>> findAll() {
        return ResponseEntity.ok(accountService.findAll());
    }

    @GetMapping("/me")
    @Operation(summary = "Busca a própria conta bancária", tags = {"Contas bancárias"})
    @ApiResponse(responseCode = "200", description = "Conta encontrada")
    public ResponseEntity<AccountResponseDTO> findMyAccount(
            @AuthenticationPrincipal UserModel authenticatedUser) {
        return ResponseEntity.ok(accountService.findByUserId(authenticatedUser.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma conta por ID", tags = {"Contas bancárias"})
    @ApiResponse(responseCode = "200", description = "Conta encontrada")
    public ResponseEntity<AccountResponseDTO> findById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(accountService.findById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Busca a conta de um usuário", tags = {"Contas bancárias"})
    @ApiResponse(responseCode = "200", description = "Conta encontrada")
    public ResponseEntity<AccountResponseDTO> findByUserId(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(accountService.findByUserId(userId));
    }

    @PatchMapping("/me")
    @Operation(summary = "Atualiza os limites da própria conta", tags = {"Contas bancárias"})
    @ApiResponse(responseCode = "200", description = "Conta atualizada")
    public ResponseEntity<AccountResponseDTO> update(
            @AuthenticationPrincipal UserModel authenticatedUser,
            @RequestBody @Valid AccountUpdateDTO dto) {

        return ResponseEntity.ok(accountService.updateOwn(authenticatedUser.getId(), dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativa uma conta", tags = {"Contas bancárias"})
    @ApiResponse(responseCode = "204", description = "Conta desativada")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id) {

        accountService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
