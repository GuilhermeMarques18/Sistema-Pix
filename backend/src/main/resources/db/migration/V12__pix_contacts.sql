CREATE TABLE pix_contact (
    id UUID PRIMARY KEY,
    id_usuario UUID NOT NULL REFERENCES usuario (id_usuario),
    nome VARCHAR(80) NOT NULL,
    tipo_chave VARCHAR(20) NOT NULL,
    chave_pix VARCHAR(77) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_pix_contact_user_key UNIQUE (id_usuario, chave_pix),
    CONSTRAINT ck_pix_contact_key_type CHECK (
        tipo_chave IN ('CPF', 'CNPJ', 'EMAIL', 'CELULAR', 'ALEATORIO')
    )
);

CREATE INDEX idx_pix_contact_user_name ON pix_contact (id_usuario, nome);
