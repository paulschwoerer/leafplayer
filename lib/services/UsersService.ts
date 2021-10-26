import { Knex } from 'knex';

import { User } from '@/common';
import { UserRow } from '@/database/rows';
import { createPasswordHash } from '@/helpers/passwords';
import { generateUuid } from '@/helpers/uuid';

type CreateUserParams = {
  username: string;
  displayName: string;
  password: string;
};
export interface UsersService {
  createUser({
    username,
    displayName,
    password,
  }: CreateUserParams): Promise<string>;
  getAllUsers(): Promise<User[]>;
  doesUserExist(username: string): Promise<boolean>;
  findByUsername(username: string): Promise<UserRow | undefined>;
}

type Injects = {
  db: Knex;
};

export function createUsersService({ db }: Injects): UsersService {
  return {
    async createUser({ username, displayName, password }) {
      const id = generateUuid();

      await db('users').insert({
        id,
        username: username.toLocaleLowerCase(),
        displayName,
        password: createPasswordHash(password),
      });

      return id;
    },

    async doesUserExist(username) {
      const row = await db('users')
        .select('id')
        .where({ username: username.toLocaleLowerCase() })
        .first();

      return !!row;
    },

    async getAllUsers() {
      const rows = await db('users')
        .select('id', 'username', 'displayName')
        .where(true);

      return rows;
    },

    async findByUsername(username) {
      return db('users')
        .where({ username: username.toLocaleLowerCase() })
        .first();
    },
  };
}
