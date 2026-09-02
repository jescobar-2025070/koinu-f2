import { Db } from '../config/db';
import { AsignacionPresupuesto } from '../entities/asignacion-presupuesto.entity';

interface AsignacionRow {
  id: string;
  presupuesto_id: string;
  categoria_gasto_id: string;
  amount: number;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: AsignacionRow): AsignacionPresupuesto {
  return {
    id: row.id,
    presupuestoId: row.presupuesto_id,
    categoriaGastoId: row.categoria_gasto_id,
    amount: row.amount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class AsignacionPresupuestoRepository {
  constructor(private readonly db: Db) {}

  async findByPresupuesto(presupuestoId: string): Promise<AsignacionPresupuesto[]> {
    const result = await this.db.query<AsignacionRow>(
      `SELECT id, presupuesto_id, categoria_gasto_id, amount, created_at, updated_at
         FROM asignaciones_presupuesto
        WHERE presupuesto_id = $1
        ORDER BY created_at ASC`,
      [presupuestoId],
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<AsignacionPresupuesto | null> {
    const result = await this.db.query<AsignacionRow>(
      `SELECT id, presupuesto_id, categoria_gasto_id, amount, created_at, updated_at
         FROM asignaciones_presupuesto
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(data: { presupuestoId: string; categoriaGastoId: string; amount: number }): Promise<AsignacionPresupuesto> {
    const result = await this.db.query<AsignacionRow>(
      `INSERT INTO asignaciones_presupuesto (presupuesto_id, categoria_gasto_id, amount)
       VALUES ($1, $2, $3)
       RETURNING id, presupuesto_id, categoria_gasto_id, amount, created_at, updated_at`,
      [data.presupuestoId, data.categoriaGastoId, data.amount],
    );
    return mapRow(result.rows[0]);
  }

  async update(id: string, amount: number): Promise<AsignacionPresupuesto | null> {
    const result = await this.db.query<AsignacionRow>(
      `UPDATE asignaciones_presupuesto
          SET amount = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, presupuesto_id, categoria_gasto_id, amount, created_at, updated_at`,
      [amount, id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query(`DELETE FROM asignaciones_presupuesto WHERE id = $1`, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}