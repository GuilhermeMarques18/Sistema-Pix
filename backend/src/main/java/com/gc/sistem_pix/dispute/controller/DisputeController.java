package com.gc.sistem_pix.dispute.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gc.sistem_pix.dispute.dto.ContestDisputeRequest;
import com.gc.sistem_pix.dispute.dto.CreateDisputeRequest;
import com.gc.sistem_pix.dispute.dto.DisputeResponseDTO;
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
@RequestMapping("/api/pix/disputas")
@RequiredArgsConstructor
@Tag(name = "Disputas Pix")
@SecurityRequirement(name = "bearerAuth")
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    @Operation(summary = "Abre uma disputa para estorno de transação Pix (prazo máx. 3 dias)", tags = {"Disputas Pix"})
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Disputa aberta com sucesso e saldo retido"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada"),
            @ApiResponse(responseCode = "409", description = "Disputa já existente para a transação"),
            @ApiResponse(responseCode = "422", description = "Prazo expirado ou saldo indisponível na conta recebedora")
    })
    public ResponseEntity<DisputeResponseDTO> abrirDisputa(
            @Valid @RequestBody CreateDisputeRequest request,
            @AuthenticationPrincipal UserModel authenticatedUser) {
        DisputeResponseDTO response = disputeService.abrirDisputa(request, authenticatedUser);
        return ResponseEntity.created(URI.create("/api/pix/disputas/" + response.idDisputa())).body(response);
    }

    @GetMapping("/minhas")
    @Operation(summary = "Lista todas as disputas em que o usuário autenticado participa (emissor ou recebedor)", tags = {"Disputas Pix"})
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public ResponseEntity<List<DisputeResponseDTO>> listarMinhasDisputas(
            @AuthenticationPrincipal UserModel authenticatedUser) {
        return ResponseEntity.ok(disputeService.listarMinhasDisputas(authenticatedUser));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca os detalhes de uma disputa por ID", tags = {"Disputas Pix"})
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disputa encontrada"),
            @ApiResponse(responseCode = "403", description = "Acesso negado"),
            @ApiResponse(responseCode = "404", description = "Disputa não encontrada")
    })
    public ResponseEntity<DisputeResponseDTO> buscarPorId(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserModel authenticatedUser) {
        return ResponseEntity.ok(disputeService.buscarPorId(id, authenticatedUser));
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancela voluntariamente uma disputa em aberto pelo emissor", tags = {"Disputas Pix"})
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disputa cancelada e saldo retido liberado"),
            @ApiResponse(responseCode = "422", description = "Operação inválida para o status atual")
    })
    public ResponseEntity<DisputeResponseDTO> cancelarDisputa(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserModel authenticatedUser) {
        return ResponseEntity.ok(disputeService.cancelarDisputa(id, authenticatedUser));
    }

    @PostMapping("/{id}/aceitar")
    @Operation(summary = "Recebedor aceita voluntariamente a disputa, devolvendo o valor ao emissor", tags = {"Disputas Pix"})
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disputa aprovada e estorno financeiro realizado"),
            @ApiResponse(responseCode = "422", description = "Operação inválida para o status atual")
    })
    public ResponseEntity<DisputeResponseDTO> aceitarDisputa(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserModel authenticatedUser) {
        return ResponseEntity.ok(disputeService.aceitarDisputaPeloRecebedor(id, authenticatedUser));
    }

    @PostMapping("/{id}/contestar")
    @Operation(summary = "Recebedor contesta a disputa inserindo uma justificativa para avaliação do admin", tags = {"Disputas Pix"})
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contestação registrada com sucesso"),
            @ApiResponse(responseCode = "422", description = "Operação inválida para o status atual")
    })
    public ResponseEntity<DisputeResponseDTO> contestarDisputa(
            @PathVariable UUID id,
            @Valid @RequestBody ContestDisputeRequest request,
            @AuthenticationPrincipal UserModel authenticatedUser) {
        return ResponseEntity.ok(disputeService.contestarDisputaPeloRecebedor(id, request, authenticatedUser));
    }
}
