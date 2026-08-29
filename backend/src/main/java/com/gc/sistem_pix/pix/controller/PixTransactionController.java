package com.gc.sistem_pix.pix.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gc.sistem_pix.pix.dto.PixTransactionRequest;
import com.gc.sistem_pix.pix.dto.PixTransactionResponse;
import com.gc.sistem_pix.pix.service.PixTransactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pix/transactions")
@RequiredArgsConstructor
public class PixTransactionController {

    private final PixTransactionService pixTransactionService;

    @PostMapping
    public ResponseEntity<PixTransactionResponse> create(
            @Valid @RequestBody PixTransactionRequest request) {
        PixTransactionResponse response = pixTransactionService.create(request);

        URI location = URI.create("/api/pix/transactions/" + response.idTransacao());

        return ResponseEntity.created(location).body(response);
    }
}
