import Knex from 'knex';
import { UserSession } from '@common';
import uid from 'uid-safe';
import { UserRow } from '../database/rows';
import { getCurrentUnixTimestamp } from '../helpers/time';
import { generateUuid } from '../helpers/uuid';

type Browser = {
  os: string;
  name: string;
};

type SessionWithUser = {
  id: string;
  user: UserRow;
};

type Injects = {
  db: Knex;
};

type SessionCreateParams = {
  userId: string;
  browser: Browser;
  maxAge: number;
};

export interface SessionsService {
  create(params: SessionCreateParams): Promise<string>;
  deleteById(id: string): Promise<Error | undefined>;
  findWithUserByToken(token: string): Promise<SessionWithUser | undefined>;
  findByIdAndUserId(params: {
    id: string;
    userId: string;
  }): Promise<UserSession | undefined>;
  findAllByUserId(userId: string): Promise<UserSession[]>;
}

export function createSessionsService({ db }: Injects): SessionsService {
  return {
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

    async deleteById(id) {
      try {
        await db('sessions').where({ id }).delete();
      } catch (e) {
        return e;
      }
    },

    async findByIdAndUserId(params) {
      return db('sessions')
        .where(params)
        .andWhere('sessions.expiresAt', '>=', getCurrentUnixTimestamp())
        .first();
    },

    async findAllByUserId(userId) {
      return db('sessions')
        .where({ userId })
        .andWhere('sessions.expiresAt', '>=', getCurrentUnixTimestamp());
    },

    async findWithUserByToken(token) {
      const row = await db('sessions')
        .select(
          db.ref('id').as('sessionId').withSchema('sessions'),
          db.ref('id').as('userId').withSchema('users'),
          db.ref('username').withSchema('users'),
          db.ref('createdAt').withSchema('users'),
          db.ref('updatedAt').withSchema('users'),
          db.ref('displayName').withSchema('users'),
          db.ref('password').withSchema('users'),
          db.ref('createdAt').withSchema('users'),
          db.ref('updatedAt').withSchema('users'),
        )
        .innerJoin('users', 'sessions.userId', 'users.id')
        .where('sessions.token', token)
        .andWhere('sessions.expiresAt', '>=', getCurrentUnixTimestamp())
        .first();

      if (!row) {
        return undefined;
      }

      db('sessions')
        .where({ token })
        .update({
          lastUsedAt: getCurrentUnixTimestamp(),
        })
        .catch(e =>
          console.error('Could not update session lastUsedAt attribute', e),
        );

      const { sessionId, userId, ...user } = row;

      return {
        id: sessionId,
        user: {
          id: userId,
          ...user,
        },
      };
    },
  };
}
