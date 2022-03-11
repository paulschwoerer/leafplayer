import { Knex } from 'knex';

import { User } from '@/common';
import { UserRow } from '@/database/rows';
import { comparePasswords, createPasswordHash } from '@/helpers/passwords';
import { generateUuid } from '@/helpers/uuid';
import { NotFoundError } from '@/errors/NotFoundError';

type CreationParams = {
  username: string;
  displayName: string;
  password: string;
};

export interface UsersService {
  getById(id: string): Promise<User | undefined>;
  create(params: CreationParams): Promise<string>;
  findAll(): Promise<User[]>;
  exists(username: string): Promise<boolean>;
  findWithPasswordByUsername(username: string): Promise<UserRow | undefined>;
  isCorrectPassword(params: {
    userId: string;
    password: string;
  }): Promise<boolean>;
}

type Injects = {
  db: Knex;
};

export default function createUsersService({ db }: Injects): UsersService {
  return {
    async getById(id: string) {
      return db('users')
        .select('id', 'username', 'displayName')
        .where({
          id,
        })
        .first();
    },

    async create({ username, displayName, password }) {
      const id = generateUuid();

      await db('users').insert({
        id,
        username: username.toLocaleLowerCase(),
        displayName,
        password: createPasswordHash(password),
      });

      return id;
    },

    async exists(username) {
      const row = await db('users')
        .select('id')
        .where({ username: username.toLocaleLowerCase() })
        .first();

      return !!row;
    },

    async findAll() {
      const rows = await db('users')
        .select('id', 'username', 'displayName')
        .where(true);

      return rows;
    },

    async findWithPasswordByUsername(username) {
      return db('users')
        .where({ username: username.toLocaleLowerCase() })
        .first();
    },

    async isCorrectPassword({ userId, password }) {
      const row = await db('users').where({ id: userId }).first();

      if (!row) {
        throw new NotFoundError(
          `cannot find user while checking password [id=${userId}]`,
        );
      }

      return comparePasswords(password, row.password);
    },
  };
}
