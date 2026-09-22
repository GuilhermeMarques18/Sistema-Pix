package com.gc.sistem_pix.user.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gc.sistem_pix.user.dto.UserResponseDTO;
import com.gc.sistem_pix.user.dto.UserRoleUpdateDTO;
import com.gc.sistem_pix.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Administração do Sistema")
public class AdminUserController {

    private final UserService userService;

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Altera o papel (role) de um usuário. Exclusivo para OWNER.", tags = {"Administração do Sistema"})
    @ApiResponse(responseCode = "200", description = "Papel atualizado com sucesso")
    @ApiResponse(responseCode = "403", description = "Acesso negado - requer papel de OWNER")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<UserResponseDTO> updateUserRole(
            @PathVariable UUID id,
            @Valid @RequestBody UserRoleUpdateDTO dto) {
        UserResponseDTO response = userService.updateRole(id, dto.role());
        return ResponseEntity.ok(response);
    }
}
