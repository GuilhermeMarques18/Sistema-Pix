package com.gc.sistem_pix.user.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gc.sistem_pix.user.dto.LegalEntityDTO;
import com.gc.sistem_pix.user.dto.NaturalPersonDTO;
import com.gc.sistem_pix.user.dto.UserResponseDTO;
import com.gc.sistem_pix.user.dto.UserUpdateDTO;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.service.UserService;

import com.gc.sistem_pix.infra.exception.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/pessoa-fisica")
    @Operation(summary = "Cria uma pessoa física", tags = {"Usuários"})
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pessoa física criada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "409", description = "CPF, e-mail ou telefone já cadastrado")
    })
    public ResponseEntity<UserResponseDTO> createNaturalPerson(
            @Valid @RequestBody NaturalPersonDTO dto) {
        UserResponseDTO response = userService.createNaturalPerson(dto);
        return ResponseEntity.created(URI.create("/api/users/" + response.id())).body(response);
    }

    @PostMapping("/pessoa-juridica")
    @Operation(summary = "Cria uma pessoa jurídica", tags = {"Usuários"})
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pessoa jurídica criada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "409", description = "CNPJ, e-mail ou telefone já cadastrado")
    })
    public ResponseEntity<UserResponseDTO> createLegalEntity(
            @Valid @RequestBody LegalEntityDTO dto) {
        UserResponseDTO response = userService.createLegalEntity(dto);
        return ResponseEntity.created(URI.create("/api/users/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um usuário por ID", tags = {"Usuários"})
    @ApiResponse(responseCode = "200", description = "Usuário encontrado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<UserResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.searchID(id));
    }

    @GetMapping
    @Operation(summary = "Lista os usuários", tags = {"Usuários"})
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<UserResponseDTO>> listAll() {
        return ResponseEntity.ok(userService.listAll());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativa um usuário", tags = {"Usuários"})
    @ApiResponse(responseCode = "204", description = "Usuário desativado")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> remove(@PathVariable UUID id) {
        userService.remover(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me")
    @Operation(summary = "Atualiza os dados do usuário autenticado", tags = {"Usuários"})
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso"),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados inválidos ou nenhum campo informado",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(
                    responseCode = "409",
                    description = "E-mail ou telefone já cadastrado",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Usuário não autenticado")
    })
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<UserResponseDTO> update(
            @AuthenticationPrincipal UserModel authenticatedUser,
            @Valid @RequestBody UserUpdateDTO dto) {

        UserResponseDTO response = userService.update(authenticatedUser.getId(), dto);

        return ResponseEntity.ok(response);
    }
}
