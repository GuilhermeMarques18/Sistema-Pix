package com.gc.sistem_pix.pix.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gc.sistem_pix.pix.dto.PixRecipientResponse;
import com.gc.sistem_pix.pix.entity.PixKey;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.exception.InvalidPixTransactionException;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.repository.PessoaFisicaRepository;
import com.gc.sistem_pix.user.repository.PessoaJuridicaRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PixRecipientService {
    private final PixKeyService keyService;
    private final PessoaFisicaRepository naturalPersons;
    private final PessoaJuridicaRepository legalEntities;

    @Transactional(readOnly = true)
    public PixRecipientResponse resolve(PixKeyType type, String key, UserModel sender) {
        PixKey destination = keyService.findByKeyForTransfer(type, key);
        if (destination.getAccount().getUser().getId().equals(sender.getId())) throw new InvalidPixTransactionException("Não é possível enviar Pix para sua própria conta");
        if (!destination.getAccount().isAvailableForPix() || !destination.getAccount().getUser().isEnabled()) throw new InvalidPixTransactionException("Conta de destino indisponível para Pix");
        return describe(destination);
    }

    public PixRecipientResponse describe(PixKey key) {
        UserModel user = key.getAccount().getUser();
        String document = naturalPersons.findByUserId(user.getId())
                .map(person -> mask(person.getCpf()))
                .orElseGet(() -> legalEntities.findByUserId(user.getId()).map(person -> mask(person.getCnpj())).orElse(null));
        return new PixRecipientResponse(key.getType(), key.getKey(), key.getAccount().getId(), user.getName(), document);
    }

    private String mask(String value) {
        String digits = value.replaceAll("\\D", "");
        if (digits.length() == 11) return "***." + digits.substring(3, 6) + "." + digits.substring(6, 9) + "-**";
        if (digits.length() == 14) return "**.***." + digits.substring(5, 8) + "/" + digits.substring(8, 12) + "-**";
        return null;
    }
}
