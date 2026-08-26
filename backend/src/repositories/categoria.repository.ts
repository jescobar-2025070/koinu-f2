import { Db } from '../config/db';
import { Categoria, CategoriaType } from '../entities/categoria.entity';

interface CategoriaRow {
  id: string;
  name: string;
  type: CategoriaType;
  created_at: Date;
}

function mapRow(row: CategoriaRow): Categoria {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    createdAt: row.created_at,
  };
}

export class CategoriaRepository {
  constructor(private readonly db: Db) {}

  async findAll(): Promise<Categoria[]> {
    const result = await this.db.query<CategoriaRow>(
      `SELECT id, name, type, created_at
         FROM categorias
        ORDER BY type, name`,
    );
    return result.rows.map(mapRow);
  }

  async findByType(type: CategoriaType): Promise<Categoria[]> {
    const result = await this.db.query<CategoriaRow>(
      `SELECT id, name, type, created_at
         FROM categorias
        WHERE type = $1
        ORDER BY name`,
      [type],
    );
    return result.rows.map(mapRow);
  }

  async findById(id: string): Promise<Categoria | null> {
    const result = await this.db.query<CategoriaRow>(
      `SELECT id, name, type, created_at
         FROM categorias
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(data: { name: string; type: CategoriaType }): Promise<Categoria> {
    const result = await this.db.query<CategoriaRow>(
      `INSERT INTO categorias (name, type)
       VALUES ($1, $2)
       RETURNING id, name, type, created_at`,
      [data.name, data.type],
    );
    return mapRow(result.rows[0]);
  }
}