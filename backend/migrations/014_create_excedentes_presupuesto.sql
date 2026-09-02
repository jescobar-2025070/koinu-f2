CREATE TABLE excedentes_presupuesto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presupuesto_id UUID NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
    movimiento_id UUID NOT NULL REFERENCES movimientos(id) ON DELETE CASCADE,
    amount DECIMAL(14,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_excedentes_presupuesto_presupuesto ON excedentes_presupuesto (presupuesto_id);