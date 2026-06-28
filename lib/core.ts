import {
  asFunction,
  asValue,
  createContainer,
  InjectionMode,
  Lifetime,
} from 'awilix';
import { type FastifyInstance } from 'fastify';

import PackageJSON from '../package.json' with { type: 'json' };

import { createCLI } from './cli/CLI.ts';
import { createInvitationsCommandLoader } from './cli/commands/InvitationsCommandLoader.ts';
import { createLibraryCommandLoader } from './cli/commands/LibraryCommandLoader.ts';
import { createUsersCommandLoader } from './cli/commands/UserCommandLoader.ts';
import { initConfig } from './config/index.ts';
import { initializeDatabase } from './database/index.ts';
import { initServer } from './api/server.ts';

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
});

// --------------- Config initialization --------------- //
const config = initConfig();

// ----------------- DB initialization ----------------- //
const db = initializeDatabase(config.database.file);

// ----------------- DI initialization ----------------- //
container.register({
  config: asValue(config),
  db: asValue(db),
});

container.loadModules(['lib/services/*.{js,ts}'], {
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
  version: PackageJSON.version,
});

cli
  .add(container.build(createUsersCommandLoader))
  .add(container.build(createLibraryCommandLoader))
  .add(container.build(createInvitationsCommandLoader))
  .add(cli => {
    cli
      .command('serve')
      .description('launch leafplayer server')
      .action(async () => {
        const { host, port } = config;

        server = await initServer(container);

        await server.listen({ port, host });

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

  db.close();
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
].forEach(signal => process.on(signal, () => void shutdown()));

process.on('unhandledRejection', (reason: Error) => {
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  console.error(error);
  process.exit(1);
});
