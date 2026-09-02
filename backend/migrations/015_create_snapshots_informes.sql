CREATE TABLE snapshots_informes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    periodo_id UUID NOT NULL REFERENCES periodos(id) ON DELETE CASCADE,
    report_data JSONB NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_snapshots_informes_periodo ON snapshots_informes (periodo_id);