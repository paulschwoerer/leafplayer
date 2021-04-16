import path from 'path';

export type DatabaseConfig = {
  type: 'sqlite3';
  file: string;
};

export type SecurityConfig = {
  sessionMaxAge: number;
  bcryptWorkload: number;
  secret: string;
  minimumInviteCodeLength: number;
  minimumPasswordLength: number;
  invitationMaxAge: number;
};

export type LeafplayerConfig = {
  host: string;
  port: number;
  database: DatabaseConfig;
  storageDir: string;
  security: SecurityConfig;
};

function parsePort(port?: string): number {
  if (!port) {
    return 3000;
  }

  return parseInt(port);
}

let config: LeafplayerConfig | undefined;

export function initConfig(): LeafplayerConfig {
  const { APP_SECRET, HOST, PORT, NODE_ENV } = process.env;

  if (!APP_SECRET) {
    throw new Error('APP_SECRET environment variable is required');
  }

  const port = parsePort(PORT);

  if (port === NaN) {
    throw new Error('PORT environment variable needs to be a valid integer');
  }

  const storageDir =
    NODE_ENV === 'production' ? '/var/lib/leafplayer' : './.local';

  config = {
    host: HOST || '127.0.0.1',
    port,
    database: {
      type: 'sqlite3',
      file: path.join(storageDir, 'storage.db'),
    },
    storageDir,
    security: {
      secret: APP_SECRET,
      sessionMaxAge: 365 * 24 * 60 * 60,
      bcryptWorkload: 12,
      minimumInviteCodeLength: 16,
      minimumPasswordLength: 8,
      invitationMaxAge: 48 * 60 * 60,
    },
  };

  return config;
}
