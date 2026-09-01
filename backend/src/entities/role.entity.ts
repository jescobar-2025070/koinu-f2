export type RoleName = 'ADMIN' | 'USR';

export interface Role {
  id: string;
  name: RoleName;
  createdAt: Date;
}
