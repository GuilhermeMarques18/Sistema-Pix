package com.gc.sistem_pix.pix.controller;

import java.net.URI;
import java.util.UUID;
import com.gc.sistem_pix.pix.dto.ScheduledPixRequest;
import com.gc.sistem_pix.pix.dto.ScheduledPixResponse;
import com.gc.sistem_pix.pix.service.ScheduledPixService;
import com.gc.sistem_pix.user.entity.UserModel;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pix/scheduled-transactions")
@RequiredArgsConstructor
public class ScheduledPixController {
    private final ScheduledPixService service;

    @PostMapping
    public ResponseEntity<ScheduledPixResponse> create(@Valid @RequestBody ScheduledPixRequest request,
            @AuthenticationPrincipal UserModel user) {
        ScheduledPixResponse response = service.create(request, user);
        return ResponseEntity.created(URI.create("/api/pix/scheduled-transactions/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ScheduledPixResponse get(@PathVariable UUID id, @AuthenticationPrincipal UserModel user) {
        return service.get(id, user);
    }
}