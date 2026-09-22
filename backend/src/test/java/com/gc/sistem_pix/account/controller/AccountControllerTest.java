package com.gc.sistem_pix.account.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gc.sistem_pix.account.dto.AccountResponseDTO;
import com.gc.sistem_pix.account.dto.AccountUnblockRequestDTO;
import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.enums.AccountType;
import com.gc.sistem_pix.account.service.AccountService;

@ExtendWith(MockitoExtension.class)
class AccountControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AccountService accountService;

    @InjectMocks
    private AccountController accountController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(accountController).build();
    }

    @Test
    void deveBloquearContaComSucesso() throws Exception {
        UUID accountId = UUID.randomUUID();

        AccountResponseDTO responseDTO = new AccountResponseDTO(
                accountId,
                UUID.randomUUID(),
                "Usuario Teste",
                BigDecimal.ZERO,
                AccountStatus.BLOQUEADA,
                AccountType.PESSOA_FISICA,
                10,
                1000,
                LocalDateTime.now());

        when(accountService.blockAccount(accountId)).thenReturn(responseDTO);

        mockMvc.perform(patch("/accounts/{id}/block", accountId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BLOQUEADA"));

        verify(accountService).blockAccount(accountId);
    }

    @Test
    void deveDesbloquearContaComSucesso() throws Exception {
        UUID accountId = UUID.randomUUID();

        AccountResponseDTO responseDTO = new AccountResponseDTO(
                accountId,
                UUID.randomUUID(),
                "Usuario Teste",
                BigDecimal.ZERO,
                AccountStatus.DESBLOQUEADA,
                AccountType.PESSOA_FISICA,
                10,
                1000,
                LocalDateTime.now());

        when(accountService.unblockAccount(accountId)).thenReturn(responseDTO);

        mockMvc.perform(patch("/accounts/{id}/unblock", accountId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DESBLOQUEADA"));

        verify(accountService).unblockAccount(accountId);
    }

    @Test
    void deveDesbloquearPropriaContaComSucesso() throws Exception {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        AccountUnblockRequestDTO request = new AccountUnblockRequestDTO("Senha@123", "Senha@123");

        AccountResponseDTO responseDTO = new AccountResponseDTO(
                accountId,
                userId,
                "Usuario Teste",
                BigDecimal.ZERO,
                AccountStatus.DESBLOQUEADA,
                AccountType.PESSOA_FISICA,
                10,
                1000,
                LocalDateTime.now());

        when(accountService.unblockOwn(any(), any())).thenReturn(responseDTO);

        mockMvc.perform(patch("/accounts/me/unblock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DESBLOQUEADA"));

        verify(accountService).unblockOwn(any(), any());
    }
}
