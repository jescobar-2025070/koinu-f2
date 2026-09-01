export type MovimientoType = 'INCOME' | 'EXPENSE';

export interface Movimiento {
  id: string;
  userId: string;
  periodoId: string;
  type: MovimientoType;
  incomeCategoryId: string | null;
  expenseCategoryId: string | null;
  amount: number;
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
