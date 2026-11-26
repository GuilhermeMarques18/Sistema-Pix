package com.gc.sistem_pix.pix.service;

import com.gc.sistem_pix.pix.dto.PixContactRequest;
import com.gc.sistem_pix.pix.dto.PixContactResponse;
import com.gc.sistem_pix.pix.entity.PixContact;
import com.gc.sistem_pix.activity.service.UserActivityEventService;
import com.gc.sistem_pix.pix.repository.PixContactRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.exception.DuplicateResourceException;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import org.hibernate.exception.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PixContactService {

    private final PixContactRepository contacts;
    private final UserActivityEventService activityEvents;

    @Transactional(readOnly = true)
    public List<PixContactResponse> listMine(UserModel user) {
        return contacts.findAllByUser_IdOrderByNomeAsc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PixContactResponse create(PixContactRequest request, UserModel user) {
        String normalizedKey = PixKeyNormalizer.normalize(request.tipoChave(), request.chavePix());
        ensureNotDuplicate(user.getId(), normalizedKey);

        PixContact contact = PixContact.builder()
                .user(user)
                .nome(normalizeName(request.nome()))
                .tipoChave(request.tipoChave())
                .chavePix(normalizedKey)
                .build();
        PixContact saved = saveContact(contact);
        activityEvents.recordActivity(user, "PIX_CONTACT_CREATED", "Contato Pix adicionado.");
        return toResponse(saved);
    }

    @Transactional
    public PixContactResponse update(UUID id, PixContactRequest request, UserModel user) {
        PixContact contact = findOwnedContact(id, user.getId());
        String normalizedKey = PixKeyNormalizer.normalize(request.tipoChave(), request.chavePix());
        if (contacts.existsByUser_IdAndChavePixAndIdNot(user.getId(), normalizedKey, id)) {
            throw duplicateContact();
        }

        contact.setNome(normalizeName(request.nome()));
        contact.setTipoChave(request.tipoChave());
        contact.setChavePix(normalizedKey);
        PixContact updated = saveContact(contact);
        activityEvents.recordActivity(user, "PIX_CONTACT_UPDATED", "Contato Pix atualizado.");
        return toResponse(updated);
    }

    @Transactional
    public void delete(UUID id, UserModel user) {
        contacts.delete(findOwnedContact(id, user.getId()));
        activityEvents.recordActivity(user, "PIX_CONTACT_DELETED", "Contato Pix removido.");
    }

    private void ensureNotDuplicate(UUID userId, String key) {
        if (contacts.existsByUser_IdAndChavePix(userId, key)) {
            throw duplicateContact();
        }
    }

    private PixContact saveContact(PixContact contact) {
        try {
            return contacts.saveAndFlush(contact);
        } catch (DataIntegrityViolationException exception) {
            if (isDuplicateContactKey(exception)) {
                throw duplicateContact();
            }
            throw exception;
        }
    }

    private boolean isDuplicateContactKey(Throwable error) {
        for (Throwable cause = error; cause != null; cause = cause.getCause()) {
            if (cause instanceof ConstraintViolationException violation
                    && "uk_pix_contact_user_key".equals(violation.getConstraintName())) {
                return true;
            }
        }
        return false;
    }

    private String normalizeName(String name) {
        String normalized = name.trim();
        if (normalized.length() < 2 || normalized.length() > 80) {
            throw new IllegalArgumentException("O nome do contato deve ter entre 2 e 80 caracteres.");
        }
        return normalized;
    }

    private PixContact findOwnedContact(UUID id, UUID userId) {
        return contacts.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Contato Pix não encontrado."));
    }

    private DuplicateResourceException duplicateContact() {
        return new DuplicateResourceException("Esta chave Pix já está salva nos seus contatos.");
    }

    private PixContactResponse toResponse(PixContact contact) {
        return new PixContactResponse(contact.getId(), contact.getNome(), contact.getTipoChave(), contact.getChavePix());
    }
}
