package com.gc.sistem_pix.pix.service;

import com.gc.sistem_pix.email.EmailService;
import com.gc.sistem_pix.pix.entity.PixTransaction;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PixNotificationService {

    private final EmailService emailService;

    public void notifyDebit(UserModel user, PixTransaction transaction) {
        if (!wantsEmail(user)) {
            return;
        }

        String texto = """
                Olá %s,

                Você realizou uma transferência Pix.

                Valor: R$ %s
                Descrição: %s
                Data: %s

                Se você não reconhece esta transação, entre em contato imediatamente.
                """.formatted(
                user.getName(),
                transaction.getValor(),
                descricaoOu(transaction),
                transaction.getDataHora());

        emailService.sendNotification(user.getEmail(), "Pix enviado", texto);
    }

    public void notifyCredit(UserModel user, PixTransaction transaction) {
        if (!wantsEmail(user)) {
            return;
        }

        String texto = """
                Olá %s,

                Você recebeu uma transferência Pix.

                Valor: R$ %s
                Descrição: %s
                Data: %s
                """.formatted(
                user.getName(),
                transaction.getValor(),
                descricaoOu(transaction),
                transaction.getDataHora());

        emailService.sendNotification(user.getEmail(), "Pix recebido", texto);
    }

    private boolean wantsEmail(UserModel user) {
        return user != null && user.getNotificationType() == NotificationType.EMAIL;
    }

    private String descricaoOu(PixTransaction transaction) {
        return transaction.getDescricao() == null || transaction.getDescricao().isBlank()
                ? "-"
                : transaction.getDescricao();
    }
}