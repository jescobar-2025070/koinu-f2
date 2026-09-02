export type ObjetivoStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Objetivo {
  id: string;
  userId: string;
  periodoId: string | null;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  startDate: Date | null;
  status: ObjetivoStatus;
  createdAt: Date;
  updatedAt: Date;
}