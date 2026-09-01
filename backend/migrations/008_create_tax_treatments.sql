CREATE TABLE tratamientos_fiscales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,4) NOT NULL CHECK (rate >= 0 AND rate <= 1),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO tratamientos_fiscales (name, rate) VALUES
    ('Sin retención', 0),
    ('Retención ISR 5%', 0.05),
    ('Retención ISR 7%', 0.07);
