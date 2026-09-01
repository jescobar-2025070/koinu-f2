export type PeriodoStatus = 'DRAFT' | 'ACTIVE' | 'CANCELLED' | 'FINISHED';

export interface Periodo {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: PeriodoStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
