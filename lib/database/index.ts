import { chmodSync, existsSync } from 'fs';
import Knex from 'knex';
import path from 'path';
import { unixCheckIfWorldReadable } from '../helpers/filesystem';
import { createPasswordHash } from '../helpers/passwords';
import { generateUuid } from '../helpers/uuid';

type Config = {
  file: string;
  type: string;
};

export function initializeDatabase({ file, type }: Config): Knex {
  const knex = Knex({
    client: type,
    useNullAsDefault: true,
    connection: {
      filename: file,
    },
    migrations: {
      directory: path.join(__dirname, './migrations'),
    },
    pool: {
      afterCreate: (
        connection: { run(q: string, cb: () => void): void },
        cb: () => void,
      ) => connection.run('PRAGMA foreign_keys = ON', cb),
    },
  });

  const dbFileExists = existsSync(file);
  if (dbFileExists && unixCheckIfWorldReadable(file)) {
    console.warn(
      `Warning: Database file ${file} is world readable, changing mode to 600`,
    );
    chmodSync(file, 0o600);
  }

  return knex;
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
