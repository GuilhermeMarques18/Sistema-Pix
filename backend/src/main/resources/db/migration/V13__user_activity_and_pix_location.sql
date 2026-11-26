CREATE TABLE user_activity_event (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES usuario (id_usuario),
    category VARCHAR(20) NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_user_activity_category CHECK (category IN ('LOGIN', 'ACTIVITY')),
    CONSTRAINT ck_user_activity_status CHECK (status IN ('SUCCESS', 'FAILURE'))
);

CREATE INDEX idx_user_activity_history
    ON user_activity_event (user_id, category, created_at DESC);

ALTER TABLE transacao
    ADD COLUMN location_latitude NUMERIC(10, 7),
    ADD COLUMN location_longitude NUMERIC(10, 7),
    ADD COLUMN location_accuracy_meters NUMERIC(10, 2),
    ADD COLUMN location_source VARCHAR(20);

ALTER TABLE scheduled_pix
    ADD COLUMN location_latitude NUMERIC(10, 7),
    ADD COLUMN location_longitude NUMERIC(10, 7),
    ADD COLUMN location_accuracy_meters NUMERIC(10, 2),
    ADD COLUMN location_source VARCHAR(20);
