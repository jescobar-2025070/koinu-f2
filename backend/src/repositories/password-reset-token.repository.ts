import { Db } from '../config/db';

export interface PasswordResetTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

interface PasswordResetTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

function mapRow(row: PasswordResetTokenRow): PasswordResetTokenRecord {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    createdAt: row.created_at,
  };
}

export class PasswordResetTokenRepository {
  constructor(private readonly db: Db) {}

  async create(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<PasswordResetTokenRecord> {
    const result = await this.db.query<PasswordResetTokenRow>(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, token_hash, expires_at, used_at, created_at`,
      [data.userId, data.tokenHash, data.expiresAt],
    );
    return mapRow(result.rows[0]);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
    const result = await this.db.query<PasswordResetTokenRow>(
      `SELECT id, user_id, token_hash, expires_at, used_at, created_at
         FROM password_reset_tokens
        WHERE token_hash = $1
        LIMIT 1`,
      [tokenHash],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async markUsed(id: string): Promise<boolean> {
    const result = await this.db.query(
      `UPDATE password_reset_tokens
          SET used_at = NOW()
        WHERE id = $1 AND used_at IS NULL`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.db.query(
      `UPDATE password_reset_tokens
          SET used_at = NOW()
        WHERE user_id = $1 AND used_at IS NULL`,
      [userId],
    );
  }
}