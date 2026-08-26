export type CategoriaType = 'ingreso' | 'gasto';

export interface Categoria {
  id: string;
  name: string;
  type: CategoriaType;
  createdAt: Date;
}