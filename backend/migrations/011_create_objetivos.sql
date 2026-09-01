CREATE TABLE objetivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(14,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    deadline DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_objetivos_user_id ON objetivos (user_id);
