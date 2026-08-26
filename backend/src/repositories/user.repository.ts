import { Db } from '../config/db';
import { User } from '../entities/user.entity';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export class UserRepository {
  constructor(private readonly db: Db) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query<UserRow>(
      `SELECT id, email, password_hash, is_active, created_at, updated_at, deleted_at
         FROM users
        WHERE email = $1
        LIMIT 1`,
      [email],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query<UserRow>(
      `SELECT id, email, password_hash, is_active, created_at, updated_at, deleted_at
         FROM users
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    const result = await this.db.query<UserRow>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, password_hash, is_active, created_at, updated_at, deleted_at`,
      [data.email, data.passwordHash],
    );
    return mapRow(result.rows[0]);
  }
}
