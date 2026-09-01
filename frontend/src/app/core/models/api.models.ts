export type PeriodoStatus = 'DRAFT' | 'ACTIVE' | 'CANCELLED' | 'FINISHED';

export interface Periodo {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PeriodoStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

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
  date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DetalleIngreso {
  movementId: string;
  taxTreatmentId: string | null;
  grossAmount: number;
  retentionAmount: number;
  netAmount: number;
}

export interface Categoria {
  id: string;
  userId: string | null;
  name: string;
  isDefault: boolean;
  isActive: boolean;
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

export interface DashboardData {
  periodoActivo: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  totalIngresos: number;
  totalGastos: number;
  disponible: number;
  objetivos: {
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    progress: number;
  }[];
}
