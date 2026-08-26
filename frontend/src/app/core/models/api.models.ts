export interface Periodo {
  id: string;
  userId: string;
  year: number;
  month: number;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MovimientoType = 'ingreso' | 'gasto';

export interface Movimiento {
  id: string;
  userId: string;
  periodoId: string;
  categoriaId: string;
  type: MovimientoType;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Categoria {
  id: string;
  name: string;
  type: 'ingreso' | 'gasto';
  createdAt: string;
}

export interface Objetivo {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MovimientoStats {
  totalIngresos: number;
  totalGastos: number;
}
