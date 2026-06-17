import uid from 'uid-safe';

import { type LeafplayerConfig } from '../lib/config/index.ts';
import { type DB, initializeDatabase } from '../lib/database/index.ts';
import { generateUuid } from '../lib/helpers/uuid.ts';

export async function setupInMemorySQLiteDB(): Promise<DB> {
  const db = initializeDatabase(':memory:');

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
