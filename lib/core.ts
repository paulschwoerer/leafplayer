import { Command } from 'commander';
import { FastifyInstance } from 'fastify';
import { DBCommands } from './cli/DBCommands';
import { InvitationsCommands } from './cli/InvitationsCommands';
import { LibraryCommands } from './cli/LibraryCommands';
import { UsersCommands } from './cli/UsersCommands';
import { initConfig } from './config';
import { initializeDatabase, runMigrations } from './database';
import { initServer } from './server';
import { createAlbumsService } from './services/AlbumsService';
import { createArtistsService } from './services/ArtistsService';
import { createArtworksService } from './services/ArtworksService';
import { createAudioFilesService } from './services/AudioFilesService';
import { createAuthService } from './services/AuthService';
import { createDiscoverService } from './services/DiscoverService';
import { createInvitationsService } from './services/InvitationsService';
import { createLibraryService } from './services/LibraryService';
import { createSearchService } from './services/SearchService';
import { createSessionsService } from './services/SessionsService';
import { createSongsService } from './services/SongsService';
import { createUsersService } from './services/UsersService';

// --------------- Config initialization --------------- //
const config = initConfig();

// ----------------- DB initialization ----------------- //
const db = initializeDatabase(config.database);

// --------------- Service initialization -------------- //
const usersService = createUsersService({ db });
const songsService = createSongsService({ db });
const searchService = createSearchService({ db });
const albumsService = createAlbumsService({ db, songsService });
const artworksService = createArtworksService({ config });
const sessionsService = createSessionsService({ db });
const authService = createAuthService({
  sessionsService,
  config: config.security,
  usersService,
});
const artistsService = createArtistsService({
  db,
  albumsService,
  songsService,
});
const libraryService = createLibraryService({ db, config });
const audioFilesService = createAudioFilesService({ db });
const invitationsService = createInvitationsService({
  db,
  config,
  usersService,
});
const discoverService = createDiscoverService({ db });

// ----------------- CLI initialization ----------------- //
let server: FastifyInstance;
const program = new Command();

DBCommands(program, { db });
LibraryCommands(program, {
  config,
  db,
  audioFilesService,
  albumsService,
  artistsService,
  libraryService,
});
InvitationsCommands(program, { invitationsService });
UsersCommands(program, { usersService });

program
  .command('serve')
  .description('launch leafplayer server')
  .action(async () => {
    const { host, port } = config;

    await runMigrations(db);

    server = await initServer({
      config,
      albumsService,
      artistsService,
      searchService,
      artworksService,
      authService,
      sessionsService,
      invitationsService,
      audioFilesService,
      discoverService,
    });

    await server.listen(port, host);

    console.log(`🌱 Leafplayer server listening on port ${port}`);
  });

// -------------------- Main -------------------- //
async function main() {
  await program.parseAsync(process.argv);

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
