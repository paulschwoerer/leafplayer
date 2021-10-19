import commander from 'commander';
import Knex from 'knex';
import { runMigrations, seedDevDatabase } from '@/database';
import { printInfo, printSuccess } from '@/helpers/cli';

type Injects = {
  db: Knex;
};

export function DBCommands(cli: commander.Command, { db }: Injects): void {
  cli
    .command('db:migrate')
    .description('migrate database to latest migration')
    .action(async () => {
      printInfo('Running migrations ...');
      await runMigrations(db);
      printSuccess('Migrations finished');
    });

  cli
    .command('db:seed-dev')
    .description('seed database with DEVELOPMENT records')
    .action(async () => {
      printInfo('Seeding database for development ...');
      await seedDevDatabase(db);
      printSuccess('Database seeded');
    });
}
