import { Db } from '../config/db';
import { SnapshotInforme } from '../entities/snapshot-informe.entity';

interface SnapshotRow {
  id: string;
  periodo_id: string;
  report_data: unknown;
  generated_at: Date;
}

function mapRow(row: SnapshotRow): SnapshotInforme {
  return {
    id: row.id,
    periodoId: row.periodo_id,
    reportData: row.report_data,
    generatedAt: row.generated_at,
  };
}

export class SnapshotInformeRepository {
  constructor(private readonly db: Db) {}

  async findByPeriodo(periodoId: string): Promise<SnapshotInforme | null> {
    const result = await this.db.query<SnapshotRow>(
      `SELECT id, periodo_id, report_data, generated_at
         FROM snapshots_informes
        WHERE periodo_id = $1
        ORDER BY generated_at DESC
        LIMIT 1`,
      [periodoId],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(data: { periodoId: string; reportData: unknown }): Promise<SnapshotInforme> {
    const result = await this.db.query<SnapshotRow>(
      `INSERT INTO snapshots_informes (periodo_id, report_data)
       VALUES ($1, $2::jsonb)
       RETURNING id, periodo_id, report_data, generated_at`,
      [data.periodoId, JSON.stringify(data.reportData)],
    );
    return mapRow(result.rows[0]);
  }
}