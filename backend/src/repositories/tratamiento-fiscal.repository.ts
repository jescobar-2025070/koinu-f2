import { Db } from '../config/db';

export interface TratamientoFiscal {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
  createdAt: Date;
}

interface TratamientoRow {
  id: string;
  name: string;
  rate: number;
  is_active: boolean;
  created_at: Date;
}

function mapRow(row: TratamientoRow): TratamientoFiscal {
  return {
    id: row.id,
    name: row.name,
    rate: row.rate,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export class TratamientoFiscalRepository {
  constructor(private readonly db: Db) {}

  async findAll(): Promise<TratamientoFiscal[]> {
    const result = await this.db.query<TratamientoRow>(
      `SELECT id, name, rate, is_active, created_at
         FROM tratamientos_fiscales
        WHERE is_active = TRUE
        ORDER BY rate ASC`,
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<TratamientoFiscal | null> {
    const result = await this.db.query<TratamientoRow>(
      `SELECT id, name, rate, is_active, created_at
         FROM tratamientos_fiscales
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}
