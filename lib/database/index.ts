import { chmodSync, existsSync, readdirSync, readFileSync } from 'fs';
import path from 'path';

import DatabaseConstructor, {
  Database,
  Statement as DriverStatement,
} from 'better-sqlite3';

import { unixCheckIfWorldReadable } from '../helpers/filesystem.ts';

const migrationsDir = path.join(__dirname, './migrations');

export interface DB {
  prepare<TBind extends unknown[] | unknown = unknown[], TResult = unknown>(
    sql: string,
  ): Statement<TBind, TResult>;
  driver(): Database;
  close(): void;
}

export interface Statement<
  TBind extends unknown | unknown[],
  TResult = unknown,
> {
  run(...bind: TBind extends unknown[] ? TBind : [TBind]): number;
  first(
    ...bind: TBind extends unknown[] ? TBind : [TBind]
  ): TResult | undefined;
  all(...bind: TBind extends unknown[] ? TBind : [TBind]): TResult[];
}

export function initializeDatabase(filename: string): DB {
  const driver: Database = new DatabaseConstructor(filename);

  const dbFileExists = existsSync(filename);
  if (dbFileExists && unixCheckIfWorldReadable(filename)) {
    console.warn(
      `Warning: Database file ${filename} is world readable, changing mode to 600`,
    );
    chmodSync(filename, 0o600);
  }

  driver.pragma('foreign_keys = ON');

  migrateLatest(driver);

  return {
    prepare<TBind = unknown, TResult = unknown>(sql: string) {
      let stmt: DriverStatement<TBind[], TResult>;
      try {
        stmt = driver.prepare<TBind[], TResult>(sql);
      } catch (e) {
        console.error('cannot prepare query', e);
        throw e;
      }

      return {
        run(...params: TBind[]): number {
          return stmt.run(...params).changes;
        },
        first(...params: TBind[]): TResult | undefined {
          return stmt.get(...params);
        },
        all(...params: TBind[]): TResult[] {
          return stmt.all(...params);
        },
      };
    },
    driver() {
      return driver;
    },
    close() {
      driver.close();
    },
  };
}

function migrateLatest(driver: Database) {
  let currentVersion = getVersion(driver);

  if (currentVersion === 0) {
    currentVersion = getLegacyVersion(driver);
  }

  const migrationFiles = getAllMigrationFiles();

  const targetVersion = getMaximumVersion(migrationFiles);

  if (targetVersion < currentVersion) {
    throw new Error('migrating back is unsupported');
  }

  if (targetVersion === currentVersion) {
    return;
  }

  console.log('Migrating database to latest version ...');

  for (let i = currentVersion + 1; i <= targetVersion; i++) {
    const migrationFile = migrationFiles.get(i);
    if (!migrationFile) {
      throw new Error(`could not find migration file '${migrationFile}'`);
    }

    console.debug(`  Running migration '${migrationFile}'`);

    const migrationSQL = readFileSync(
      path.join(migrationsDir, migrationFile),
    ).toString('utf-8');

    driver.exec(`BEGIN IMMEDIATE TRANSACTION; ${migrationSQL} COMMIT;`);
    setVersion(driver, i);
  }

  console.log('Finished migrating database');
}

function getVersion(driver: Database): number {
  return driver.pragma('user_version', { simple: true }) as number;
}

/*
 * Retrieve version from knex_migrations table, if present, for backwards-compatibility
 */
function getLegacyVersion(driver: Database): number {
  const tableExists = !!driver
    .prepare(
      `SELECT name FROM sqlite_schema WHERE type = 'table' AND name='knex_migrations'`,
    )
    .get();

  if (!tableExists) {
    return 0;
  }

  const row = driver
    .prepare<unknown[], { count: number }>(
      'SELECT COUNT(*) AS count FROM knex_migrations',
    )
    .get();

  return row?.count || 0;
}

function setVersion(driver: Database, version: number): void {
  driver.pragma(`user_version = ${version}`);
}

function getMaximumVersion(migrationFiles: Map<number, string>): number {
  return Math.max(0, ...migrationFiles.keys());
}

function getAllMigrationFiles(): Map<number, string> {
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

  const map = new Map<number, string>();
  for (const f of files) {
    const serial = parseInt(f.split('_')[0]);
    map.set(serial, f);
  }

  return map;
}
