import { User } from '@/common';
import { UserRow, WithoutTimestamps } from '@/database/rows';
import { comparePasswords, createPasswordHash } from '@/helpers/passwords';
import { generateUuid } from '@/helpers/uuid';
import { NotFoundError } from '@/errors/NotFoundError';
import { DB } from '@/database';

type CreationParams = {
  username: string;
  displayName: string;
  password: string;
};

export interface UsersService {
  getById(id: string): User | undefined;
  create(params: CreationParams): string;
  findAll(): User[];
  exists(username: string): boolean;
  findWithPasswordByUsername(username: string): UserRow | undefined;
  isCorrectPassword(params: { userId: string; password: string }): boolean;
}

type Injects = {
  db: DB;
};

export default function createUsersService({ db }: Injects): UsersService {
  return {
    getById(id: string) {
      return db
        .prepare<string, User>(
          'SELECT id, username, displayName FROM users WHERE id = ?',
        )
        .first(id);
    },

    create({ username, displayName, password }) {
      const id = generateUuid();

      db.prepare<WithoutTimestamps<UserRow>>(
        `INSERT INTO users
            (id, username, displayName, password)
          VALUES
            (:id, :username, :displayName, :password)`,
      ).run({
        id,
        username: username.toLocaleLowerCase(),
        displayName,
        password: createPasswordHash(password),
      });

      return id;
    },

    exists(username) {
      const row = db
        .prepare<string, { id: string }>(
          'SELECT id FROM users WHERE username = ?',
        )
        .first(username.toLocaleLowerCase());

      return !!row;
    },

    findAll() {
      const rows = db
        .prepare<unknown[], User>('SELECT id, username, displayName FROM users')
        .all();

      return rows;
    },

    findWithPasswordByUsername(username) {
      return db
        .prepare<string, UserRow>('SELECT * FROM users WHERE username = ?')
        .first(username.toLocaleLowerCase());
    },

    isCorrectPassword({ userId, password }) {
      const row = db
        .prepare<string, { password: string }>(
          'SELECT password FROM users WHERE id = ?',
        )
        .first(userId);

      if (!row) {
        throw new NotFoundError(
          `cannot find user while checking password [id=${userId}]`,
        );
      }

      return comparePasswords(password, row.password);
    },
  };
}
