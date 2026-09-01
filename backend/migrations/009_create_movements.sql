CREATE TABLE movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    periodo_id UUID NOT NULL REFERENCES periodos(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    income_category_id UUID REFERENCES categorias_ingreso(id) ON DELETE RESTRICT,
    expense_category_id UUID REFERENCES categorias_gasto(id) ON DELETE RESTRICT,
    amount DECIMAL(14,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_movimiento_categoria CHECK (
        (type = 'INCOME' AND income_category_id IS NOT NULL AND expense_category_id IS NULL) OR
        (type = 'EXPENSE' AND expense_category_id IS NOT NULL AND income_category_id IS NULL)
    )
);

CREATE INDEX idx_movimientos_user_periodo ON movimientos (user_id, periodo_id);
CREATE INDEX idx_movimientos_date ON movimientos (date);
CREATE INDEX idx_movimientos_type ON movimientos (type);
