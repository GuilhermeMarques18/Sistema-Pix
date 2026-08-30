ALTER TABLE chave_pix
    ADD CONSTRAINT uk_chave_pix_conta_tipo
    UNIQUE (id_conta_bancaria, tipo);
