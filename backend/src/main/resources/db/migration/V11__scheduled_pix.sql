CREATE TABLE scheduled_pix (
    id UUID PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES conta_bancaria(id_conta_bancaria),
    destination_id UUID NOT NULL REFERENCES conta_bancaria(id_conta_bancaria),
    idempotency_key UUID NOT NULL,
    pix_key VARCHAR(77) NOT NULL,
    key_type VARCHAR(20) NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    description VARCHAR(100),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL,
    transaction_id UUID,
    failure_reason VARCHAR(500),
    CONSTRAINT uk_scheduled_pix_idempotency UNIQUE (source_id, idempotency_key)
);
CREATE INDEX idx_scheduled_pix_due ON scheduled_pix (scheduled_at) WHERE status = 'PENDING';