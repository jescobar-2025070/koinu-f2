export interface CategoriaIngreso {
  id: string;
  userId: string | null;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}
