export interface DetalleIngreso {
  movementId: string;
  taxTreatmentId: string | null;
  grossAmount: number;
  retentionAmount: number;
  netAmount: number;
}
