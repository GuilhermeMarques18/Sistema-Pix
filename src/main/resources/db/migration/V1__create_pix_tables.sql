CREATE TABLE chave_pix (
    id_chave_pix UUID PRIMARY KEY,
    id_conta_bancaria UUID NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    chave VARCHAR(77) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_chave_pix_chave UNIQUE (chave),
    CONSTRAINT ck_chave_pix_tipo CHECK (
        tipo IN ('CPF', 'CNPJ', 'EMAIL', 'CELULAR', 'ALEATORIO')
    )
);

CREATE INDEX idx_chave_pix_conta_bancaria
    ON chave_pix (id_conta_bancaria);

CREATE TABLE transacao (
    id_transacao UUID PRIMARY KEY,
    id_conta_origem UUID NOT NULL,
    id_conta_destino UUID NOT NULL,
    descricao VARCHAR(255),
    valor NUMERIC(19, 2) NOT NULL,
    -- transacao_estornada BOOLEAN NOT NULL DEFAULT FALSE,
    -- transacao_agendada BOOLEAN NOT NULL DEFAULT FALSE,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- local_transacao VARCHAR(255),

    CONSTRAINT ck_transacao_valor_positivo CHECK (valor > 0),
    CONSTRAINT ck_transacao_contas_diferentes CHECK (
        id_conta_origem <> id_conta_destino
    )
);

CREATE INDEX idx_transacao_conta_origem
    ON transacao (id_conta_origem);

CREATE INDEX idx_transacao_conta_destino
    ON transacao (id_conta_destino);

CREATE INDEX idx_transacao_data_hora
    ON transacao (data_hora);
