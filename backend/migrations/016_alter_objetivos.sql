ALTER TABLE objetivos
    ADD COLUMN periodo_id UUID REFERENCES periodos(id) ON DELETE SET NULL,
    ADD COLUMN description TEXT,
    ADD COLUMN start_date DATE,
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'));

CREATE INDEX idx_objetivos_periodo_id ON objetivos (periodo_id);