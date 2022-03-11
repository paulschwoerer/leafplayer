import { Knex } from 'knex';
import uid from 'uid-safe';

import { UserSession } from '@/common';
import { getCurrentUnixTimestamp } from '@/helpers/time';
import { generateUuid } from '@/helpers/uuid';
import { toUserSession } from '@/mappers/sessions';
import { NotFoundError } from '@/errors/NotFoundError';

type Browser = {
  os: string;
  name: string;
};

type Injects = {
  db: Knex;
};

type CreationParams = {
  userId: string;
  browser: Browser;
  maxAge: number;
};

type RetrievalParams = {
  id?: string;
  userId?: string;
  token?: string;
};

type UpdateParams = {
  lastUsedAt?: number;
};

export interface SessionsService {
  get(params: RetrievalParams): Promise<UserSession | undefined>;
  findByUserId(userId: string): Promise<UserSession[]>;
  create(params: CreationParams): Promise<string>;
  update(id: string, params: UpdateParams): Promise<void>;
  deleteById(id: string): Promise<void>;
}

export default function createSessionsService({
  db,
}: Injects): SessionsService {
  return {
    async get(params) {
      const session = await db('sessions')
        .where(params)
        .andWhere('sessions.expiresAt', '>=', getCurrentUnixTimestamp())
        .first();

      if (!session) {
        return undefined;
      }

      return toUserSession(session);
    },

    async findByUserId(userId) {
      const sessions = await db('sessions')
        .where({
          userId,
        })
        .andWhere('sessions.expiresAt', '>=', getCurrentUnixTimestamp());

      return sessions.map(toUserSession);
    },

    async create({ userId, browser, maxAge }) {
      const token = uid.sync(24);

      const timestamp = getCurrentUnixTimestamp();

      await db('sessions').insert({
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

    async update(id, params) {
      await db('sessions').where({ id }).update(params);
    },

    async deleteById(id) {
      const rowsAffected = await db('sessions').where({ id }).delete();

      if (rowsAffected === 0) {
        throw new NotFoundError('cannot find session to revoke');
      }
    },
  };
}
