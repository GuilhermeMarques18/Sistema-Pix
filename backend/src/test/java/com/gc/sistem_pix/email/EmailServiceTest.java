package com.gc.sistem_pix.email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

class EmailServiceTest {

    private JavaMailSender mailSender;
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        mailSender = Mockito.mock(JavaMailSender.class);
        emailService = new EmailService(mailSender);
        ReflectionTestUtils.setField(emailService, "remetente", "pix@example.com");
    }

    @Test
    void deveEnviarMensagemComRemetenteDestinoAssuntoETexto() {
        emailService.sendNotification("usuario@example.com", "Pix recebido", "Você recebeu um Pix.");

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage message = messageCaptor.getValue();
        assertEquals("pix@example.com", message.getFrom());
        assertEquals("usuario@example.com", message.getTo()[0]);
        assertEquals("Pix recebido", message.getSubject());
        assertEquals("Você recebeu um Pix.", message.getText());
    }

    @Test
    void naoDeveEnviarQuandoRemetenteNaoEstaConfigurado() {
        ReflectionTestUtils.setField(emailService, "remetente", "");

        emailService.sendNotification("usuario@example.com", "Pix recebido", "Você recebeu um Pix.");

        verifyNoInteractions(mailSender);
    }
}
