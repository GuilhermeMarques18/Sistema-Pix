package com.gc.sistem_pix.account.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gc.sistem_pix.account.dto.AccountResponseDTO;
import com.gc.sistem_pix.account.dto.AccountUnblockRequestDTO;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Lista todas as contas bancárias (Exclusivo ADMIN/OWNER)", tags = {"Administração do Sistema"})
    @ApiResponse(responseCode = "200", description = "Contas retornadas com sucesso")
    @ApiResponse(responseCode = "403", description = "Acesso negado - requer papel de ADMIN ou OWNER")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Busca uma conta por ID (Exclusivo ADMIN/OWNER)", tags = {"Administração do Sistema"})
    @ApiResponse(responseCode = "200", description = "Conta encontrada")
    @ApiResponse(responseCode = "403", description = "Acesso negado - requer papel de ADMIN ou OWNER")
    public ResponseEntity<AccountResponseDTO> findById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(accountService.findById(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Busca a conta de um usuário (Exclusivo ADMIN/OWNER)", tags = {"Administração do Sistema"})
    @ApiResponse(responseCode = "200", description = "Conta encontrada")
    @ApiResponse(responseCode = "403", description = "Acesso negado - requer papel de ADMIN ou OWNER")
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

    @PatchMapping("/{id}/block")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Bloqueia uma conta bancária por suspeita de fraude (Exclusivo ADMIN/OWNER)", tags = {"Administração do Sistema"})
    @ApiResponse(responseCode = "200", description = "Conta bloqueada com sucesso")
    @ApiResponse(responseCode = "403", description = "Acesso negado - requer papel de ADMIN ou OWNER")
    public ResponseEntity<AccountResponseDTO> block(
            @PathVariable UUID id) {

        return ResponseEntity.ok(accountService.blockAccount(id));
    }

    @PatchMapping("/me/unblock")
    @Operation(summary = "Desbloqueia a própria conta bancária mediante confirmação de senha", tags = {"Contas bancárias"})
    @ApiResponse(responseCode = "200", description = "Conta desbloqueada com sucesso")
    public ResponseEntity<AccountResponseDTO> unblockOwn(
            @AuthenticationPrincipal UserModel authenticatedUser,
            @RequestBody @Valid AccountUnblockRequestDTO dto) {

        return ResponseEntity.ok(accountService.unblockOwn(authenticatedUser.getId(), dto));
    }

    @PatchMapping("/{id}/unblock")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Desbloqueia uma conta bancária administrativamente (Exclusivo ADMIN/OWNER)", tags = {"Administração do Sistema"})
    @ApiResponse(responseCode = "200", description = "Conta desbloqueada com sucesso")
    @ApiResponse(responseCode = "403", description = "Acesso negado - requer papel de ADMIN ou OWNER")
    public ResponseEntity<AccountResponseDTO> unblock(
            @PathVariable UUID id) {

        return ResponseEntity.ok(accountService.unblockAccount(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @Operation(summary = "Desativa uma conta bancária (Exclusivo ADMIN/OWNER)", tags = {"Administração do Sistema"})
    @ApiResponse(responseCode = "204", description = "Conta desativada")
    @ApiResponse(responseCode = "403", description = "Acesso negado - requer papel de ADMIN ou OWNER")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id) {

        accountService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
