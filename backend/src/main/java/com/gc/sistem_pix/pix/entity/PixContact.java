package com.gc.sistem_pix.pix.entity;

import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.user.entity.UserModel;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "pix_contact",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_pix_contact_user_key",
        columnNames = {"id_usuario", "chave_pix"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PixContact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private UserModel user;

    @Column(name = "nome", nullable = false, length = 80)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_chave", nullable = false, length = 20)
    private PixKeyType tipoChave;

    @Column(name = "chave_pix", nullable = false, length = 77)
    private String chavePix;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
