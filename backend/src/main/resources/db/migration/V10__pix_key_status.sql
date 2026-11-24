ALTER TABLE chave_pix
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',
    ADD CONSTRAINT ck_chave_pix_status CHECK (status IN ('ATIVA', 'SUSPENSA'));
