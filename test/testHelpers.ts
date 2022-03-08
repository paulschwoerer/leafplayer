import { Knex } from 'knex';
import uid from 'uid-safe';

import { LeafplayerConfig } from '~/config';
import { initializeDatabase, runMigrations } from '~/database';
import { generateUuid } from '~/helpers/uuid';

export async function setupInMemorySQLiteDB(): Promise<Knex> {
  const db = initializeDatabase({
    type: 'sqlite3',
    file: ':memory:',
  });

  await runMigrations(db);

  return db;
}

export function createLeafplayerConfig(): LeafplayerConfig {
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
