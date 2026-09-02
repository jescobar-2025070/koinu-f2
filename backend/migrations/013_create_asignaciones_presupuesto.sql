CREATE TABLE asignaciones_presupuesto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presupuesto_id UUID NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
    categoria_gasto_id UUID NOT NULL REFERENCES categorias_gasto(id) ON DELETE RESTRICT,
    amount DECIMAL(14,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_asignaciones_presupuesto_categoria UNIQUE (presupuesto_id, categoria_gasto_id)
);

CREATE INDEX idx_asignaciones_presupuesto_presupuesto ON asignaciones_presupuesto (presupuesto_id);