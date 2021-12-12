import {
  asFunction,
  asValue,
  createContainer,
  InjectionMode,
  Lifetime,
} from 'awilix';
import { FastifyInstance } from 'fastify';

import { version } from '../package.json';

import { createCLI } from './cli/CLI';
import { createDBCommandLoader } from './cli/commands/DBCommandLoader';
import { createInvitationsCommandLoader } from './cli/commands/InvitationsCommandLoader';
import { createLibraryCommandLoader } from './cli/commands/LibraryCommandLoader';
import { createUsersCommandLoader } from './cli/commands/UserCommandLoader';
import { initConfig } from './config';
import { initializeDatabase, runMigrations } from './database';
import { initServer } from './api/server';

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
});

// --------------- Config initialization --------------- //
const config = initConfig();

// ----------------- DB initialization ----------------- //
const db = initializeDatabase(config.database);

// ----------------- DI initialization ----------------- //
container.register({
  config: asValue(config),
  db: asValue(db),
});

container.loadModules(['lib/services/*.ts'], {
  resolverOptions: {
    register: asFunction,
    lifetime: Lifetime.SINGLETON,
  },
  formatName: 'camelCase',
});

// ---------------- Server initialization --------------- //
let server: FastifyInstance;

// ----------------- CLI initialization ----------------- //
const cli = createCLI({
  version,
});

cli
  .add(container.build(createDBCommandLoader))
  .add(container.build(createUsersCommandLoader))
  .add(container.build(createLibraryCommandLoader))
  .add(container.build(createInvitationsCommandLoader))
  .add(cli => {
    cli
      .command('serve')
      .description('launch leafplayer server')
      .action(async () => {
        const { host, port } = config;

        await runMigrations(db);

        server = await initServer(container);

        await server.listen(port, host);

        console.log(`🌱 Leafplayer server listening on port ${port}`);
      });
  });

// -------------------- Main -------------------- //
async function main() {
  await cli.parse();

  if (!server) {
    await shutdown();
  }
}

main().catch(shutdown);

async function shutdown(err?: Error) {
  if (err) {
    console.error(`Shutting down due to error: ${err.message}`);

    if (err.stack) {
      console.log(err.stack);
    }
  }

  if (server) {
    await server.close();
  }

  await db.destroy();
  await container.dispose();

  process.exit(1);
}

[
  'SIGHUP',
  'SIGINT',
  'SIGQUIT',
  'SIGILL',
  'SIGTRAP',
  'SIGABRT',
  'SIGBUS',
  'SIGFPE',
  'SIGUSR1',
  'SIGSEGV',
  'SIGUSR2',
  'SIGTERM',
].forEach(signal => process.on(signal, () => shutdown()));

process.on('unhandledRejection', (reason: Error) => {
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  console.error(error);
  process.exit(1);
});
