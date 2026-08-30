CREATE TABLE usuario (
    id_usuario UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_notificacao VARCHAR(77),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMP,
    CONSTRAINT ck_usuario_tipo_notificacao
        CHECK (tipo_notificacao IS NULL OR tipo_notificacao IN ('EMAIL', 'SMS'))
);

CREATE TABLE pessoa_fisica (
    id_pessoa_fisica UUID PRIMARY KEY,
    id_usuario UUID NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pessoa_fisica_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);

CREATE TABLE pessoa_juridica (
    id_pessoa_juridica UUID PRIMARY KEY,
    id_usuario UUID NOT NULL UNIQUE,
    cnpj VARCHAR(14) NOT NULL UNIQUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pessoa_juridica_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
);
