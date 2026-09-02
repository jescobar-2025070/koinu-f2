import { Db } from '../config/db';
import { Presupuesto } from '../entities/presupuesto.entity';

interface PresupuestoRow {
  id: string;
  periodo_id: string;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: PresupuestoRow): Presupuesto {
  return {
    id: row.id,
    periodoId: row.periodo_id,
    totalAmount: row.total_amount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PresupuestoRepository {
  constructor(private readonly db: Db) {}

  async findByPeriodo(periodoId: string): Promise<Presupuesto | null> {
    const result = await this.db.query<PresupuestoRow>(
      `SELECT id, periodo_id, total_amount, created_at, updated_at
         FROM presupuestos
        WHERE periodo_id = $1
        LIMIT 1`,
      [periodoId],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findById(id: string): Promise<Presupuesto | null> {
    const result = await this.db.query<PresupuestoRow>(
      `SELECT id, periodo_id, total_amount, created_at, updated_at
         FROM presupuestos
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(data: { periodoId: string; totalAmount: number }): Promise<Presupuesto> {
    const result = await this.db.query<PresupuestoRow>(
      `INSERT INTO presupuestos (periodo_id, total_amount)
       VALUES ($1, $2)
       RETURNING id, periodo_id, total_amount, created_at, updated_at`,
      [data.periodoId, data.totalAmount],
    );
    return mapRow(result.rows[0]);
  }

  async update(id: string, totalAmount: number): Promise<Presupuesto | null> {
    const result = await this.db.query<PresupuestoRow>(
      `UPDATE presupuestos
          SET total_amount = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, periodo_id, total_amount, created_at, updated_at`,
      [totalAmount, id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query(`DELETE FROM presupuestos WHERE id = $1`, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}