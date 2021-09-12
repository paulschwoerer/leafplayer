import Knex from 'knex';
import path from 'path';
import { Service } from 'typedi';

@Service()
export class DBConnector {
  public readonly query: Knex;

  constructor(file: string) {
    this.query = this.init(file);
  }

  private init(file: string) {
    const knex = Knex({
      client: 'sqlite3',
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

    return knex;
  }
}
