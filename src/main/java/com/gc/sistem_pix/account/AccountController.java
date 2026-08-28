package com.gc.sistem_pix.account;

import com.gc.sistem_pix.account.dto.AccountRequestDTO;
import com.gc.sistem_pix.account.dto.AccountResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponseDTO> create(@RequestBody @Valid AccountRequestDTO dto) {
        AccountResponseDTO response = accountService.createAccount(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponseDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(accountService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<AccountResponseDTO> findByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(accountService.findByUserId(userId));
    }
}