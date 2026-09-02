export interface AsignacionPresupuesto {
  id: string;
  presupuestoId: string;
  categoriaGastoId: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}