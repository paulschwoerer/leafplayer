import { ExecutionContext } from 'ava';
import { FastifyInstance } from 'fastify';
import { Response as LightMyRequestResponse } from 'light-my-request';
import { v4 as uuidv4 } from 'uuid';
import { createPasswordHash } from '../lib/helpers/passwords';
import { initServer } from '../lib/server';
import { createAlbumsService } from '../lib/services/AlbumsService';
import { createArtistsService } from '../lib/services/ArtistsService';
import { createArtworksService } from '../lib/services/ArtworksService';
import { createAudioFilesService } from '../lib/services/AudioFilesService';
import { createAuthService } from '../lib/services/AuthService';
import { createInvitationsService } from '../lib/services/InvitationsService';
import { createSessionsService } from '../lib/services/SessionsService';
import { createSongsService } from '../lib/services/SongsService';
import { createUsersService } from '../lib/services/UsersService';
import { TestContext } from './testContext';

export async function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function insertValidTestUser(
  t: ExecutionContext<TestContext>,
): Promise<string> {
  const { db } = t.context;

  const id = uuidv4();

  await db('users').insert({
    id,
    username: 'admin',
    displayName: 'Admin',
    password: createPasswordHash('validPa$$word'),
  });

  return id;
}

export function extractSessionTokenFromCookie(
  response: LightMyRequestResponse,
): string | null {
  type Cookie = {
    name: string;
    value: string;
  };

  const cookies = response.cookies as Cookie[];

  const sessionCookie = cookies.find(cookie => cookie.name === 'id');

  return sessionCookie?.value || null;
}

export function createServerFromTestContext(
  t: ExecutionContext<TestContext>,
): Promise<FastifyInstance> {
  const { config, db } = t.context;

  const sessionsService = createSessionsService({ db });
  const usersService = createUsersService({ db });
  const songsService = createSongsService({ db });
  const albumsService = createAlbumsService({ db, songsService });
  const artworksService = createArtworksService({ config });
  const authService = createAuthService({
    usersService,
    config: config.security,
    sessionsService,
  });
  const artistsService = createArtistsService({
    db,
    albumsService,
    songsService,
  });
  const audioFilesService = createAudioFilesService({ db });
  const invitationsService = createInvitationsService({
    db,
    config: config.security,
    usersService,
  });

  return initServer({
    config,
    sessionsService,
    albumsService: albumsService,
    artistsService: artistsService,
    songsService: songsService,
    artworksService,
    authService,
    invitationsService,
    audioFilesService: audioFilesService,
  });
}

export async function insertTestUserAndLogin({
  t,
  server,
}: {
  t: ExecutionContext<TestContext>;
  server: FastifyInstance;
}): Promise<{ sessionToken: string; userId: string }> {
  const userId = await insertValidTestUser(t);

  const response = await server.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: {
      username: 'admin',
      password: 'validPa$$word',
    },
  });

  const sessionToken = extractSessionTokenFromCookie(response);

  if (!sessionToken) {
    throw new Error('No session token returned for login request');
  }

  return {
    sessionToken,
    userId,
  };
}

export async function createServerAndInsertTestUserAndLogin(
  t: ExecutionContext<TestContext>,
): Promise<{
  sessionToken: string;
  userId: string;
  server: FastifyInstance;
}> {
  const server = await createServerFromTestContext(t);

  const { sessionToken, userId } = await insertTestUserAndLogin({ t, server });

  return {
    server,
    sessionToken,
    userId,
  };
}
