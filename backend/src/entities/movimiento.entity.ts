export type MovimientoType = 'ingreso' | 'gasto';

export interface Movimiento {
  id: string;
  userId: string;
  periodoId: string;
  categoriaId: string;
  type: MovimientoType;
  amount: number;
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}