package com.gc.sistem_pix.pix.service;

import com.gc.sistem_pix.pix.dto.PixContactRequest;
import com.gc.sistem_pix.pix.entity.PixContact;
import com.gc.sistem_pix.activity.service.UserActivityEventService;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.repository.PixContactRepository;
import com.gc.sistem_pix.pix.exception.InvalidPixKeyException;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.exception.DuplicateResourceException;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PixContactServiceTest {

    @Mock
    private PixContactRepository contacts;

    @Mock
    private UserActivityEventService activityEvents;

    @InjectMocks
    private PixContactService service;

    @Test
    void createsNormalizedContactOwnedByAuthenticatedUser() {
        UUID userId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).build();
        PixContactRequest request = new PixContactRequest("  Maria  ", PixKeyType.EMAIL, "MARIA@EXAMPLE.COM");
        when(contacts.existsByUser_IdAndChavePix(userId, "maria@example.com")).thenReturn(false);
        when(contacts.saveAndFlush(any(PixContact.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.create(request, user);

        ArgumentCaptor<PixContact> captor = ArgumentCaptor.forClass(PixContact.class);
        verify(contacts).saveAndFlush(captor.capture());
        assertEquals(user, captor.getValue().getUser());
        assertEquals("Maria", captor.getValue().getNome());
        assertEquals("maria@example.com", response.chavePix());
        assertEquals(PixKeyType.EMAIL, response.tipoChave());
    }

    @Test
    void rejectsDuplicateKeyForSameUser() {
        UUID userId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).build();
        when(contacts.existsByUser_IdAndChavePix(userId, "maria@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> service.create(new PixContactRequest("Maria", PixKeyType.EMAIL, "maria@example.com"), user));

        verify(contacts, never()).saveAndFlush(any());
    }

    @Test
    void rejectsMalformedPixKeyBeforePersistence() {
        UserModel user = UserModel.builder().id(UUID.randomUUID()).build();

        assertThrows(InvalidPixKeyException.class,
                () -> service.create(new PixContactRequest("Maria", PixKeyType.EMAIL, "not-an-email"), user));

        verify(contacts, never()).saveAndFlush(any());
    }

    @Test
    void cannotUpdateContactThatDoesNotBelongToAuthenticatedUser() {
        UUID contactId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(UUID.randomUUID()).build();
        when(contacts.findByIdAndUser_Id(contactId, user.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.update(
                contactId,
                new PixContactRequest("Maria", PixKeyType.EMAIL, "maria@example.com"),
                user));

        verify(contacts, never()).saveAndFlush(any());
    }
}
