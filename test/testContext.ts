import { ExecutionContext } from 'ava';
import Knex from 'knex';
import uid from 'uid-safe';
import { LeafplayerConfig } from '@/config';
import { initializeDatabase, runMigrations } from '@/database';
import { removeDir } from '@/helpers/filesystem';
import { generateUuid } from '@/helpers/uuid';

export type TestContext = {
  db: Knex;
  config: LeafplayerConfig;
};

function createLeafplayerConfig(): LeafplayerConfig {
  const artworkDir = `/tmp/leafplayer-test-storage-${generateUuid()}`;

  return {
    database: {
      type: 'sqlite3',
      file: 'test.local.db',
    },
    storageDir: artworkDir,
    host: '127.0.0.1',
    port: 3005,
    security: {
      secret: uid.sync(32),
      sessionMaxAge: 4,
      bcryptWorkload: 12,
      minimumInviteCodeLength: 16,
      minimumPasswordLength: 8,
      invitationMaxAge: 5,
    },
  };
}

async function setupInMemorySQLiteDB(): Promise<Knex> {
  const db = initializeDatabase({
    type: 'sqlite3',
    file: ':memory:',
  });

  await runMigrations(db);

  return db;
}

export async function beforeEachHook(
  t: ExecutionContext<TestContext>,
): Promise<void> {
  const config = createLeafplayerConfig();
  const db = await setupInMemorySQLiteDB();

  t.context.config = config;
  t.context.db = db;
}

export async function afterEachHook(
  t: ExecutionContext<TestContext>,
): Promise<void> {
  await t.context.db.destroy();

  await removeDir(t.context.config.storageDir);
}
