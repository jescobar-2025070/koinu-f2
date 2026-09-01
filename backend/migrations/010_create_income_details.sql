CREATE TABLE detalles_ingreso (
    movement_id UUID PRIMARY KEY REFERENCES movimientos(id) ON DELETE CASCADE,
    tax_treatment_id UUID REFERENCES tratamientos_fiscales(id),
    gross_amount DECIMAL(14,2) NOT NULL CHECK (gross_amount > 0),
    retention_amount DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK (retention_amount >= 0),
    net_amount DECIMAL(14,2) NOT NULL,
    CONSTRAINT chk_retencion_menor_bruto CHECK (retention_amount <= gross_amount),
    CONSTRAINT chk_neto_correcto CHECK (net_amount = gross_amount - retention_amount)
);
