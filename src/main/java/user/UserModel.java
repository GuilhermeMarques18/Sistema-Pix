package user;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedDate;
import user.enumeration.TypePerson;

import java.time.LocalDateTime;
import java.util.UUID;

@SQLRestriction("ativo = true")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "users")
@Data
public class UserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "Nome não pode estar nulo")
    @Size(min = 3, max = 150)
    @Column(nullable = false)
    private String name;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Pattern(regexp = "\\+?[0-9]{10,13}", message = "Telefone inválido")
    @Column(nullable = false, unique = true)
    private String telefone;

    @NotBlank
    @Column(nullable = false, unique = true)
    private  String docs;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    private TypePerson typePerson;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdUser;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    private LocalDateTime deletedAt;
}