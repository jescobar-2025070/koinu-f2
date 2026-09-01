CREATE TABLE categorias_gasto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categorias_gasto_user_id ON categorias_gasto (user_id);

INSERT INTO categorias_gasto (user_id, name, is_default) VALUES
    (NULL, 'Alimentación', TRUE),
    (NULL, 'Transporte', TRUE),
    (NULL, 'Educación', TRUE),
    (NULL, 'Servicios', TRUE),
    (NULL, 'Otros Gastos', TRUE);
