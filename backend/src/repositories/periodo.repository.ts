import { Db } from '../config/db';
import { Periodo } from '../entities/periodo.entity';

interface PeriodoRow {
  id: string;
  user_id: string;
  year: number;
  month: number;
  is_open: boolean;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: PeriodoRow): Periodo {
  return {
    id: row.id,
    userId: row.user_id,
    year: row.year,
    month: row.month,
    isOpen: row.is_open,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PeriodoRepository {
  constructor(private readonly db: Db) {}

  async findByUserAndPeriod(userId: string, year: number, month: number): Promise<Periodo | null> {
    const result = await this.db.query<PeriodoRow>(
      `SELECT id, user_id, year, month, is_open, created_at, updated_at
         FROM periodos
        WHERE user_id = $1 AND year = $2 AND month = $3
        LIMIT 1`,
      [userId, year, month],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findByUser(userId: string): Promise<Periodo[]> {
    const result = await this.db.query<PeriodoRow>(
      `SELECT id, user_id, year, month, is_open, created_at, updated_at
         FROM periodos
        WHERE user_id = $1
        ORDER BY year DESC, month DESC`,
      [userId],
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Periodo | null> {
    const result = await this.db.query<PeriodoRow>(
      `SELECT id, user_id, year, month, is_open, created_at, updated_at
         FROM periodos
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(data: { userId: string; year: number; month: number }): Promise<Periodo> {
    const result = await this.db.query<PeriodoRow>(
      `INSERT INTO periodos (user_id, year, month)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, year, month, is_open, created_at, updated_at`,
      [data.userId, data.year, data.month],
    );
    return mapRow(result.rows[0]);
  }

  async close(id: string): Promise<Periodo | null> {
    const result = await this.db.query<PeriodoRow>(
      `UPDATE periodos
          SET is_open = FALSE, updated_at = NOW()
        WHERE id = $1
        RETURNING id, user_id, year, month, is_open, created_at, updated_at`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async update(id: string, data: { year?: number; month?: number }): Promise<Periodo | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.year !== undefined) {
      updates.push(`year = $${paramIndex}`);
      params.push(data.year);
      paramIndex++;
    }

    if (data.month !== undefined) {
      updates.push(`month = $${paramIndex}`);
      params.push(data.month);
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const result = await this.db.query<PeriodoRow>(
      `UPDATE periodos
          SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, user_id, year, month, is_open, created_at, updated_at`,
      params,
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}