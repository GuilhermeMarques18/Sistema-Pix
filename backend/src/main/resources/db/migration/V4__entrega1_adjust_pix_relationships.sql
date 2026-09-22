ALTER TABLE transacao
    ALTER COLUMN descricao TYPE VARCHAR(100);

ALTER TABLE chave_pix
    ADD CONSTRAINT fk_chave_pix_conta_bancaria
    FOREIGN KEY (id_conta_bancaria)
    REFERENCES conta_bancaria (id_conta_bancaria);

ALTER TABLE transacao
    ADD CONSTRAINT fk_transacao_conta_origem
    FOREIGN KEY (id_conta_origem)
    REFERENCES conta_bancaria (id_conta_bancaria);

ALTER TABLE transacao
    ADD CONSTRAINT fk_transacao_conta_destino
    FOREIGN KEY (id_conta_destino)
    REFERENCES conta_bancaria (id_conta_bancaria);
