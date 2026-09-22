ALTER TABLE conta_bancaria
    ALTER COLUMN limite_pix TYPE INTEGER,
    ALTER COLUMN limite_pix SET DEFAULT 1000;

ALTER TABLE conta_bancaria
    ALTER COLUMN limite_transacoes SET DEFAULT 10;

UPDATE conta_bancaria
SET limite_pix = 1000
WHERE limite_pix = 0;

UPDATE conta_bancaria
SET limite_transacoes = 10
WHERE limite_transacoes = 0;