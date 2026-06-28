import uid from 'uid-safe';
import { type UserSession } from 'leafplayer-common';

import { getCurrentUnixTimestamp } from '../helpers/time.ts';
import { generateUuid } from '../helpers/uuid.ts';
import { toUserSession } from '../mappers/sessions.ts';
import { NotFoundError } from '../errors/NotFoundError.ts';
import { type DB } from '../database/index.ts';
import { type SessionRow } from '../database/rows.ts';

type Browser = {
  os: string;
  name: string;
};

type Injects = {
  db: DB;
};

type CreationParams = {
  userId: string;
  browser: Browser;
  maxAge: number;
};

type UpdateParams = {
  lastUsedAt?: number;
};

export interface SessionsService {
  getByToken(token: string): UserSession | undefined;
  findByUserId(userId: string): UserSession[];
  create(params: CreationParams): string;
  update(id: string, params: UpdateParams): void;
  deleteById(id: string): void;
}

export default function createSessionsService({
  db,
}: Injects): SessionsService {
  return {
    getByToken(token) {
      const session = db
        .prepare<{ token: string; expiresAt: number }, SessionRow>(
          'SELECT * FROM sessions WHERE token = :token AND expiresAt >= :expiresAt',
        )
        .first({
          token,
          expiresAt: getCurrentUnixTimestamp(),
        });

      if (!session) {
        return undefined;
      }

      return toUserSession(session);
    },

    findByUserId(userId) {
      const sessions = db
        .prepare<{ userId: string; expiresAt: number }, SessionRow>(
          'SELECT * FROM sessions WHERE userId = :userId AND expiresAt >= :expiresAt',
        )
        .all({
          userId,
          expiresAt: getCurrentUnixTimestamp(),
        });

      return sessions.map(toUserSession);
    },

    create({ userId, browser, maxAge }) {
      const token = uid.sync(24);

      const timestamp = getCurrentUnixTimestamp();

      db.prepare<SessionRow>(
        `INSERT INTO sessions
        (id, userId, token, lastUsedAt, expiresAt, browser, os)
        VALUES
        (:id, :userId, :token, :lastUsedAt, :expiresAt, :browser, :os)`,
      ).run({
        id: generateUuid(),
        userId,
        token,
        lastUsedAt: timestamp,
        expiresAt: timestamp + maxAge,
        browser: browser.name,
        os: browser.os,
      });

      return token;
    },

    update(id, { lastUsedAt }) {
      db.prepare<UpdateParams & { id: string }>(
        'UPDATE sessions SET lastUsedAt = :lastUsedAt WHERE id = :id',
      ).run({ id, lastUsedAt });
    },

    deleteById(id) {
      const rowsAffected = db
        .prepare<string>('DELETE FROM sessions WHERE id = ?')
        .run(id);

      if (rowsAffected === 0) {
        throw new NotFoundError('cannot find session to revoke');
      }
    },
  };
}
