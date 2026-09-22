package com.gc.sistem_pix.email;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    @Async
    public void sendNotification(String para, String assunto, String texto) {
        if (para == null || para.isBlank()) {
            log.warn("Tentativa de envio de e-mail sem destinatário. Assunto: '{}'", assunto);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remetente);
            message.setTo(para);
            message.setSubject(assunto);
            message.setText(texto);

            mailSender.send(message);
            log.info("E-mail de notificação enviado para {}", mask(para));
        } catch (MailException e) {
            log.error("Falha ao enviar e-mail para {}: {}", mask(para), e.getMessage(), e);
        }
    }

    private String mask(String email) {
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***" + email.substring(Math.max(at, 0));
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}