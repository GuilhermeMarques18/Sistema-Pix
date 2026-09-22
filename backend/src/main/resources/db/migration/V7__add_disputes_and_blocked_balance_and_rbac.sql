ALTER TABLE usuario ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';
ALTER TABLE usuario ADD CONSTRAINT ck_usuario_role CHECK (role IN ('USER', 'ADMIN', 'OWNER'));

ALTER TABLE conta_bancaria ADD COLUMN saldo_bloqueado NUMERIC(19, 2) NOT NULL DEFAULT 0;
ALTER TABLE conta_bancaria ADD CONSTRAINT ck_conta_bancaria_saldo_bloqueado 
    CHECK (saldo_bloqueado >= 0 AND saldo_bloqueado <= saldo);

ALTER TABLE transacao ADD COLUMN IF NOT EXISTS transacao_estornada BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE disputa_pix (
    id_disputa UUID PRIMARY KEY,
    id_transacao UUID NOT NULL UNIQUE,
    id_conta_solicitante UUID NOT NULL,
    id_conta_destino UUID NOT NULL,
    valor NUMERIC(19, 2) NOT NULL,
    motivo_abertura VARCHAR(500) NOT NULL,
    justificativa_recebedor VARCHAR(1000),
    justificativa_admin VARCHAR(1000),
    status VARCHAR(30) NOT NULL DEFAULT 'ABERTA',
    resolvido_por VARCHAR(30),
    resolvido_em TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_disputa_transacao FOREIGN KEY (id_transacao) REFERENCES transacao (id_transacao),
    CONSTRAINT fk_disputa_solicitante FOREIGN KEY (id_conta_solicitante) REFERENCES conta_bancaria (id_conta_bancaria),
    CONSTRAINT fk_disputa_destino FOREIGN KEY (id_conta_destino) REFERENCES conta_bancaria (id_conta_bancaria),
    CONSTRAINT ck_disputa_valor_positivo CHECK (valor > 0),
    CONSTRAINT ck_disputa_status CHECK (status IN ('ABERTA', 'CONTESTADA', 'APROVADA', 'RECUSADA', 'CANCELADA')),
    CONSTRAINT ck_disputa_resolvido_por CHECK (resolvido_por IS NULL OR resolvido_por IN ('ADMIN', 'OWNER', 'RECEBEDOR', 'EMISSOR'))
);

CREATE INDEX idx_disputa_transacao ON disputa_pix (id_transacao);
CREATE INDEX idx_disputa_solicitante ON disputa_pix (id_conta_solicitante);
CREATE INDEX idx_disputa_destino ON disputa_pix (id_conta_destino);
CREATE INDEX idx_disputa_status ON disputa_pix (status);

INSERT INTO usuario (id_usuario, nome, email, telefone, senha, role, ativo, criado_em)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Administrador Chefe (Owner)',
    'admin@gmail.com',
    '21972672346',
    '$2a$10$IO13MsXkkvAay0a7Br6fzOOYkAtvbxl/aqqF2I7DC7jfZhSGZeJeq', --Senha: admin
    'OWNER',
    TRUE,
    CURRENT_TIMESTAMP
);

INSERT INTO pessoa_fisica (id_pessoa_fisica, id_usuario, cpf, criado_em)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '00000000001',
    CURRENT_TIMESTAMP
);

INSERT INTO conta_bancaria (id_conta_bancaria, id_usuario, saldo, saldo_bloqueado, status, tipo, limite_transacoes, limite_pix, ativo, criado_em)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    10000.00,
    0.00,
    'DESBLOQUEADA',
    'PESSOA_FISICA',
    100,
    50000,
    TRUE,
    CURRENT_TIMESTAMP
);
