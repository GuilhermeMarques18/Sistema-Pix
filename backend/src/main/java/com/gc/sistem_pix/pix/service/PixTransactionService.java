package com.gc.sistem_pix.pix.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.pix.dto.PixTransactionRequest;
import com.gc.sistem_pix.pix.dto.PixTransactionResponse;
import com.gc.sistem_pix.pix.entity.PixKey;
import com.gc.sistem_pix.pix.entity.PixTransaction;
import com.gc.sistem_pix.pix.exception.InvalidPixTransactionException;
import com.gc.sistem_pix.pix.repository.PixTransactionRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PixTransactionService {

    private final PixTransactionRepository pixTransactionRepository;
    private final AccountRepository accountRepository;
    private final PixKeyService pixKeyService;

    @Transactional
    public PixTransactionResponse create(PixTransactionRequest request, UserModel authenticatedUser) {
        validateRequest(request, authenticatedUser);

        AccountModel sourceAccount = accountRepository.findByUserId(authenticatedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Conta bancária não encontrada para o usuário autenticado"));

        PixKey destinationKey = pixKeyService.findByKeyForTransfer(request.chavePix());
        UUID sourceAccountId = sourceAccount.getId();
        UUID destinationAccountId = destinationKey.getAccount().getId();

        if (sourceAccountId.equals(destinationAccountId)) {
            throw new InvalidPixTransactionException(
                    "A conta de origem deve ser diferente da conta de destino");
        }

        AccountModel originAccount;
        AccountModel destinationAccount;

        if (sourceAccountId.compareTo(destinationAccountId) < 0) {
            originAccount = findAccountForUpdate(sourceAccountId);
            destinationAccount = findAccountForUpdate(destinationAccountId);
        } else {
            destinationAccount = findAccountForUpdate(destinationAccountId);
            originAccount = findAccountForUpdate(sourceAccountId);
        }

        if (!originAccount.isAvailableForPix()) {
            throw new InvalidPixTransactionException("Conta de origem indisponível para Pix");
        }

        if (!destinationAccount.isAvailableForPix()) {
            throw new InvalidPixTransactionException("Conta de destino indisponível para Pix");
        }

        originAccount.debit(request.valor());
        destinationAccount.credit(request.valor());

        accountRepository.save(originAccount);
        accountRepository.save(destinationAccount);

        PixTransaction transaction = PixTransaction.builder()
                .contaOrigemId(originAccount.getId())
                .contaDestinoId(destinationAccount.getId())
                .valor(request.valor())
                .descricao(request.descricao())
                .build();

        PixTransaction savedTransaction = pixTransactionRepository.save(transaction);

        return toResponse(savedTransaction);
    }

    @Transactional(readOnly = true)
    public List<PixTransactionResponse> findAll() {
        return pixTransactionRepository.findAllByOrderByDataHoraDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PixTransactionResponse> findAllByUserId(UUID userId) {
        AccountModel account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Conta bancária não encontrada para este usuário"));

        return pixTransactionRepository
                .findAllByContaOrigemIdOrContaDestinoIdOrderByDataHoraDesc(
                        account.getId(),
                        account.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AccountModel findAccountForUpdate(UUID accountId) {
        return accountRepository.findByIdForUpdate(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada: " + accountId));
    }

    private void validateRequest(PixTransactionRequest request, UserModel authenticatedUser) {
        if (request == null) {
            throw new InvalidPixTransactionException("Dados da transação são obrigatórios");
        }

        if (authenticatedUser == null || authenticatedUser.getId() == null) {
            throw new InvalidPixTransactionException("Usuário autenticado é obrigatório");
        }

        if (request.chavePix() == null || request.chavePix().isBlank()) {
            throw new InvalidPixTransactionException("Chave Pix de destino é obrigatória");
        }

        if (request.valor() == null) {
            throw new InvalidPixTransactionException("Valor da transação é obrigatório");
        }

        if (request.valor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidPixTransactionException("Valor da transação deve ser maior que zero");
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
