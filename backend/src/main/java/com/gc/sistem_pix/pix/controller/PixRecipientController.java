package com.gc.sistem_pix.pix.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.gc.sistem_pix.pix.dto.PixRecipientResponse;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.service.PixRecipientService;
import com.gc.sistem_pix.user.entity.UserModel;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pix/recipients")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PixRecipientController {
    private final PixRecipientService service;

    @GetMapping("/resolve")
    @Operation(summary = "Resolve o destinatário de Pix sem expor dados financeiros", tags = {"Transações Pix"})
    public PixRecipientResponse resolve(@RequestParam PixKeyType tipo, @RequestParam String chave, @AuthenticationPrincipal UserModel user) {
        return service.resolve(tipo, chave, user);
    }
}
