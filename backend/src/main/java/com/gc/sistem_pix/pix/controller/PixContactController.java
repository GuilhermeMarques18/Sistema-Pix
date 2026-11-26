package com.gc.sistem_pix.pix.controller;

import com.gc.sistem_pix.pix.dto.PixContactRequest;
import com.gc.sistem_pix.pix.dto.PixContactResponse;
import com.gc.sistem_pix.pix.service.PixContactService;
import com.gc.sistem_pix.user.entity.UserModel;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pix/contacts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class PixContactController {

    private final PixContactService service;

    @GetMapping
    public List<PixContactResponse> listMine(@AuthenticationPrincipal UserModel user) {
        return service.listMine(user);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PixContactResponse create(
            @Valid @RequestBody PixContactRequest request,
            @AuthenticationPrincipal UserModel user) {
        return service.create(request, user);
    }

    @PutMapping("/{id}")
    public PixContactResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody PixContactRequest request,
            @AuthenticationPrincipal UserModel user) {
        return service.update(id, request, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserModel user) {
        service.delete(id, user);
    }
}
