export interface Objetivo {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
}