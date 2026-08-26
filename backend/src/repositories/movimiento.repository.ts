import { Db } from '../config/db';
import { Movimiento, MovimientoType } from '../entities/movimiento.entity';

interface MovimientoRow {
  id: string;
  user_id: string;
  periodo_id: string;
  categoria_id: string;
  type: MovimientoType;
  amount: number;
  description: string | null;
  date: Date;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: MovimientoRow): Movimiento {
  return {
    id: row.id,
    userId: row.user_id,
    periodoId: row.periodo_id,
    categoriaId: row.categoria_id,
    type: row.type,
    amount: row.amount,
    description: row.description,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class MovimientoRepository {
  constructor(private readonly db: Db) {}

  async findByUser(userId: string, limit: number = 100): Promise<Movimiento[]> {
    const result = await this.db.query<MovimientoRow>(
      `SELECT id, user_id, periodo_id, categoria_id, type, amount, description, date, created_at, updated_at
         FROM movimientos
        WHERE user_id = $1
        ORDER BY date DESC, created_at DESC
        LIMIT $2`,
      [userId, limit],
    );
    return result.rows.map(mapRow);
  }

  async findByPeriodo(periodoId: string): Promise<Movimiento[]> {
    const result = await this.db.query<MovimientoRow>(
      `SELECT id, user_id, periodo_id, categoria_id, type, amount, description, date, created_at, updated_at
         FROM movimientos
        WHERE periodo_id = $1
        ORDER BY date DESC, created_at DESC`,
      [periodoId],
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Movimiento | null> {
    const result = await this.db.query<MovimientoRow>(
      `SELECT id, user_id, periodo_id, categoria_id, type, amount, description, date, created_at, updated_at
         FROM movimientos
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async getStats(userId: string, periodoId?: string): Promise<{ totalIngresos: number; totalGastos: number }> {
    let query = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'ingreso' THEN amount ELSE 0 END), 0) as total_ingresos,
        COALESCE(SUM(CASE WHEN type = 'gasto' THEN amount ELSE 0 END), 0) as total_gastos
      FROM movimientos
      WHERE user_id = $1
    `;
    const params: any[] = [userId];

    if (periodoId) {
      query += ' AND periodo_id = $2';
      params.push(periodoId);
    }

    const result = await this.db.query<{ total_ingresos: number; total_gastos: number }>(query, params);
    return {
      totalIngresos: result.rows[0].total_ingresos,
      totalGastos: result.rows[0].total_gastos,
    };
  }

  async create(data: {
    userId: string;
    periodoId: string;
    categoriaId: string;
    type: MovimientoType;
    amount: number;
    description?: string;
    date?: Date;
  }): Promise<Movimiento> {
    const result = await this.db.query<MovimientoRow>(
      `INSERT INTO movimientos (user_id, periodo_id, categoria_id, type, amount, description, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, periodo_id, categoria_id, type, amount, description, date, created_at, updated_at`,
      [data.userId, data.periodoId, data.categoriaId, data.type, data.amount, data.description || null, data.date || new Date()],
    );
    return mapRow(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM movimientos WHERE id = $1`,
      [id],
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}