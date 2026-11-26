package com.gc.sistem_pix.pix.service;

import com.gc.sistem_pix.email.EmailService;
import com.gc.sistem_pix.pix.entity.PixTransaction;
import com.gc.sistem_pix.pix.event.PixTransferCompletedEvent;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.enums.NotificationType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class PixNotificationServiceTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PixNotificationService pixNotificationService;

    @Test
    void deveEnviarEmailParaRemetenteEDestinatarioQuandoAmbosOptaramPorEmail() {
        UserModel sender = user("remetente@example.com", NotificationType.EMAIL);
        UserModel recipient = user("destinatario@example.com", NotificationType.EMAIL);
        PixTransaction transaction = transaction();

        pixNotificationService.afterTransferCommit(new PixTransferCompletedEvent(sender, recipient, transaction));

        verify(emailService).sendNotification(
                eq("remetente@example.com"), eq("Pix enviado"), contains("Você realizou uma transferência Pix."));
        verify(emailService).sendNotification(
                eq("destinatario@example.com"), eq("Pix recebido"), contains("Você recebeu uma transferência Pix."));
    }

    @Test
    void naoDeveEnviarEmailQuandoUsuariosNaoOptaramPorEmail() {
        UserModel sender = user("remetente@example.com", NotificationType.SMS);
        UserModel recipient = user("destinatario@example.com", null);

        pixNotificationService.afterTransferCommit(new PixTransferCompletedEvent(sender, recipient, transaction()));

        verifyNoInteractions(emailService);
    }

    private UserModel user(String email, NotificationType notificationType) {
        return UserModel.builder()
                .name("Usuário Pix")
                .email(email)
                .notificationType(notificationType)
                .build();
    }

    private PixTransaction transaction() {
        return PixTransaction.builder()
                .valor(new BigDecimal("25.50"))
                .descricao("Pagamento")
                .dataHora(LocalDateTime.of(2026, 11, 26, 16, 0))
                .build();
    }
}
