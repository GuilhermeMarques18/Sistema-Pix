package com.gc.sistem_pix.pix.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gc.sistem_pix.pix.dto.PixTransactionRequest;
import com.gc.sistem_pix.pix.dto.PixTransactionResponse;
import com.gc.sistem_pix.pix.entity.PixTransaction;
import com.gc.sistem_pix.pix.exception.InvalidPixTransactionException;
import com.gc.sistem_pix.pix.repository.PixTransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PixTransactionService {

    private final PixTransactionRepository pixTransactionRepository;

    @Transactional
    public PixTransactionResponse create(PixTransactionRequest request) {
        validateRequest(request);

        PixTransaction transaction = PixTransaction.builder()
                .contaOrigemId(request.contaOrigemId())
                .contaDestinoId(request.contaDestinoId())
                .valor(request.valor())
                .descricao(request.descricao())
                .build();

        PixTransaction savedTransaction = pixTransactionRepository.save(transaction);

        return toResponse(savedTransaction);
    }

    private void validateRequest(PixTransactionRequest request) {
        if (request == null) {
            throw new InvalidPixTransactionException("Dados da transação são obrigatórios");
        }

        if (request.contaOrigemId() == null) {
            throw new InvalidPixTransactionException("Conta de origem é obrigatória");
        }

        if (request.contaDestinoId() == null) {
            throw new InvalidPixTransactionException("Conta de destino é obrigatória");
        }

        if (request.valor() == null) {
            throw new InvalidPixTransactionException("Valor da transação é obrigatório");
        }

        if (request.valor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidPixTransactionException("Valor da transação deve ser maior que zero");
        }

        if (request.contaOrigemId().equals(request.contaDestinoId())) {
            throw new InvalidPixTransactionException(
                    "A conta de origem deve ser diferente da conta de destino");
        }
    }

    private PixTransactionResponse toResponse(PixTransaction transaction) {
        return new PixTransactionResponse(
                transaction.getIdTransacao(),
                transaction.getContaOrigemId(),
                transaction.getContaDestinoId(),
                transaction.getDescricao(),
                transaction.getValor(),
                transaction.getDataHora());
    }
}
