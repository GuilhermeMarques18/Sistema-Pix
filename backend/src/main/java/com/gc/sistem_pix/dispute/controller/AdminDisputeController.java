package com.gc.sistem_pix.dispute.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gc.sistem_pix.dispute.dto.DisputeResponseDTO;
import com.gc.sistem_pix.dispute.dto.ResolveDisputeAdminRequest;
import com.gc.sistem_pix.dispute.enums.DisputeStatus;
import com.gc.sistem_pix.dispute.service.DisputeService;
import com.gc.sistem_pix.user.entity.UserModel;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/disputas")
@RequiredArgsConstructor
@Tag(name = "Administração do Sistema")
@PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
@SecurityRequirement(name = "bearerAuth")
public class AdminDisputeController {

    private final DisputeService disputeService;

    @GetMapping
    @Operation(summary = "Lista todas as disputas do sistema com filtro opcional por status (Exclusivo ADMIN/OWNER)", tags = {"Administração do Sistema"})
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public ResponseEntity<List<DisputeResponseDTO>> listarTodas(
            @RequestParam(required = false) DisputeStatus status) {
        return ResponseEntity.ok(disputeService.listarTodasDisputasAdmin(status));
    }

    @PostMapping("/{id}/julgar")
    @Operation(summary = "Julga uma disputa aprovando (estorno) ou recusando (desbloqueio) (Exclusivo ADMIN/OWNER)", tags = {"Administração do Sistema"})
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disputa julgada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de julgamento inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso negado - requer perfil ADMIN ou OWNER"),
            @ApiResponse(responseCode = "404", description = "Disputa não encontrada"),
            @ApiResponse(responseCode = "422", description = "Operação inválida para o status atual da disputa")
    })
    public ResponseEntity<DisputeResponseDTO> julgarDisputa(
            @PathVariable UUID id,
            @Valid @RequestBody ResolveDisputeAdminRequest request,
            @AuthenticationPrincipal UserModel adminUser) {
        return ResponseEntity.ok(disputeService.julgarDisputaAdmin(id, request, adminUser));
    }
}
