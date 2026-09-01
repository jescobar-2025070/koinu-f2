CREATE TABLE categorias_ingreso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categorias_ingreso_user_id ON categorias_ingreso (user_id);

INSERT INTO categorias_ingreso (user_id, name, is_default) VALUES
    (NULL, 'Salario', TRUE),
    (NULL, 'Freelance', TRUE),
    (NULL, 'Inversiones', TRUE),
    (NULL, 'Otros Ingresos', TRUE);
