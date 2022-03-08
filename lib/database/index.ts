import { chmodSync, existsSync } from 'fs';
import path from 'path';

import { knex, Knex } from 'knex';

import { unixCheckIfWorldReadable } from '~/helpers/filesystem';
import { createPasswordHash } from '~/helpers/passwords';
import { generateUuid } from '~/helpers/uuid';

type Config = {
  file: string;
  type: string;
};

const clients = new Map<string, string>([['sqlite3', 'better-sqlite3']]);

export function initializeDatabase({ file, type }: Config): Knex {
  const client = clients.get(type);

  if (!client) {
    throw Error(`cannot find client for database type ${type}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = knex<any, Record<string, any>[]>({
    client,
    useNullAsDefault: true,
    connection: {
      filename: file,
    },
    migrations: {
      directory: path.join(__dirname, './migrations'),
    },
    pool: {
      afterCreate: (
        connection: { pragma(q: string): void },
        cb: () => void,
      ) => {
        connection.pragma('foreign_keys = ON');
        cb();
      },
    },
  });

  const dbFileExists = existsSync(file);
  if (dbFileExists && unixCheckIfWorldReadable(file)) {
    console.warn(
      `Warning: Database file ${file} is world readable, changing mode to 600`,
    );
    chmodSync(file, 0o600);
  }

  return db;
}

export function runMigrations(db: Knex): Promise<unknown> {
  return db.migrate.latest();
}

export async function seedDevDatabase(db: Knex): Promise<void> {
  await db('users').insert({
    id: generateUuid(),
    username: 'admin',
    displayName: 'Admin',
    password: createPasswordHash('admin'),
  });

  await db('users').insert({
    id: generateUuid(),
    username: 'dummy',
    displayName: 'Dummy McDummyface',
    password: createPasswordHash('dummy'),
  });

  await db('invitations').insert({
    code: 'supersecret',
    comment: 'Auto-inserted code',
    expiresAt: Number.MAX_SAFE_INTEGER,
  });

  await db('media_folders').insert({
    id: generateUuid(),
    path: `${process.env.HOME}/leafplayer-testmusic`,
  });
}
