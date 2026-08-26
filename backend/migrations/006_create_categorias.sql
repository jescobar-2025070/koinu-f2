CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ingreso', 'gasto')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);