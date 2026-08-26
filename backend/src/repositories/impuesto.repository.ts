import { Db } from '../config/db';
import { Impuesto } from '../entities/impuesto.entity';

interface ImpuestoRow {
  id: string;
  name: string;
  rate: number;
  is_active: boolean;
  created_at: Date;
}

function mapRow(row: ImpuestoRow): Impuesto {
  return {
    id: row.id,
    name: row.name,
    rate: row.rate,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export class ImpuestoRepository {
  constructor(private readonly db: Db) {}

  async findActive(): Promise<Impuesto[]> {
    const result = await this.db.query<ImpuestoRow>(
      `SELECT id, name, rate, is_active, created_at
         FROM impuestos
        WHERE is_active = TRUE
        ORDER BY name`,
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Impuesto | null> {
    const result = await this.db.query<ImpuestoRow>(
      `SELECT id, name, rate, is_active, created_at
         FROM impuestos
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}