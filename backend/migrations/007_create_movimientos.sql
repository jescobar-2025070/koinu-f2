CREATE TABLE movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    periodo_id UUID NOT NULL REFERENCES periodos(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ingreso', 'gasto')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);