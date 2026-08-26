import { Db } from '../config/db';
import { Objetivo } from '../entities/objetivo.entity';

interface ObjetivoRow {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: Date | null;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: ObjetivoRow): Objetivo {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    deadline: row.deadline,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ObjetivoRepository {
  constructor(private readonly db: Db) {}

  async findByUser(userId: string): Promise<Objetivo[]> {
    const result = await this.db.query<ObjetivoRow>(
      `SELECT id, user_id, name, target_amount, current_amount, deadline, created_at, updated_at
         FROM objetivos
        WHERE user_id = $1
        ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Objetivo | null> {
    const result = await this.db.query<ObjetivoRow>(
      `SELECT id, user_id, name, target_amount, current_amount, deadline, created_at, updated_at
         FROM objetivos
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(data: {
    userId: string;
    name: string;
    targetAmount: number;
    deadline?: Date;
  }): Promise<Objetivo> {
    const result = await this.db.query<ObjetivoRow>(
      `INSERT INTO objetivos (user_id, name, target_amount, deadline)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, target_amount, current_amount, deadline, created_at, updated_at`,
      [data.userId, data.name, data.targetAmount, data.deadline || null],
    );
    return mapRow(result.rows[0]);
  }

  async update(id: string, data: { name?: string; targetAmount?: number; deadline?: Date }): Promise<Objetivo | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }

    if (data.targetAmount !== undefined) {
      updates.push(`target_amount = $${paramIndex}`);
      params.push(data.targetAmount);
      paramIndex++;
    }

    if (data.deadline !== undefined) {
      updates.push(`deadline = $${paramIndex}`);
      params.push(data.deadline);
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const result = await this.db.query<ObjetivoRow>(
      `UPDATE objetivos
          SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, user_id, name, target_amount, current_amount, deadline, created_at, updated_at`,
      params,
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async deposit(id: string, amount: number): Promise<Objetivo | null> {
    const result = await this.db.query<ObjetivoRow>(
      `UPDATE objetivos
          SET current_amount = current_amount + $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, user_id, name, target_amount, current_amount, deadline, created_at, updated_at`,
      [amount, id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async withdraw(id: string, amount: number): Promise<Objetivo | null> {
    const result = await this.db.query<ObjetivoRow>(
      `UPDATE objetivos
          SET current_amount = GREATEST(current_amount - $1, 0), updated_at = NOW()
        WHERE id = $2
        RETURNING id, user_id, name, target_amount, current_amount, deadline, created_at, updated_at`,
      [amount, id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM objetivos WHERE id = $1`,
      [id],
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}