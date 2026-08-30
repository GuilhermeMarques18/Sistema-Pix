CREATE TABLE conta_bancaria (
    id_conta_bancaria UUID PRIMARY KEY,
    id_usuario UUID NOT NULL UNIQUE,
    saldo NUMERIC(19, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DESBLOQUEADA',
    tipo VARCHAR(20) NOT NULL,
    limite_transacoes INTEGER NOT NULL DEFAULT 0,
    limite_pix INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_conta_bancaria_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    CONSTRAINT ck_conta_bancaria_status
        CHECK (status IN ('BLOQUEADA', 'DESBLOQUEADA')),
    CONSTRAINT ck_conta_bancaria_tipo
        CHECK (tipo IN ('PESSOA_FISICA', 'PESSOA_JURIDICA')),
    CONSTRAINT ck_conta_bancaria_saldo_nao_negativo
        CHECK (saldo >= 0),
    CONSTRAINT ck_conta_bancaria_limite_transacoes
        CHECK (limite_transacoes >= 0),
    CONSTRAINT ck_conta_bancaria_limite_pix
        CHECK (limite_pix >= 0)
);

CREATE INDEX idx_conta_bancaria_usuario ON conta_bancaria (id_usuario);
