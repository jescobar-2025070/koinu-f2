CREATE TABLE periodos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'ACTIVE', 'CANCELLED', 'FINISHED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_periodo_fechas CHECK (start_date <= end_date)
);

CREATE INDEX idx_periodos_user_id ON periodos (user_id);

CREATE UNIQUE INDEX uq_periodos_one_active
    ON periodos (user_id)
    WHERE status = 'ACTIVE';
