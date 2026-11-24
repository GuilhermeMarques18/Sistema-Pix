-- Falhar explicitamente se formatos antigos apontarem o mesmo telefone para titulares diferentes.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM chave_pix WHERE tipo = 'CELULAR'
        GROUP BY CASE WHEN chave LIKE '+%' THEN chave
                      WHEN length(chave) <= 11 THEN '+55' || chave ELSE '+' || chave END
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Existem chaves de telefone equivalentes; resolva a titularidade antes de normalizar';
    END IF;
END $$;

UPDATE chave_pix SET chave = CASE WHEN chave LIKE '+%' THEN chave
                                 WHEN length(chave) <= 11 THEN '+55' || chave ELSE '+' || chave END
WHERE tipo = 'CELULAR';

ALTER TABLE transacao
    ADD COLUMN idempotency_key UUID,
    ADD COLUMN request_fingerprint VARCHAR(64),
    ADD COLUMN chave_pix VARCHAR(77),
    ADD COLUMN tipo_chave VARCHAR(20),
    ADD COLUMN nome_destinatario VARCHAR(150),
    ADD COLUMN documento_destinatario_mascarado VARCHAR(30),
    ADD CONSTRAINT uk_transacao_origem_idempotencia UNIQUE (id_conta_origem, idempotency_key);
