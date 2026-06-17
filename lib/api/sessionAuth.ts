import { preHandlerAsyncHookHandler, FastifyRequest } from 'fastify';

import { User } from 'leafplayer-common';

import { AuthService } from '../services/AuthService.ts';
import { NotAuthorizedError } from '../errors/NotAuthorizedError.ts';

declare module 'fastify' {
  interface FastifyRequest {
    currentSessionId: string;
    currentUser: User;
  }
}

export function verifySession(
  authService: AuthService,
): preHandlerAsyncHookHandler {
  return async request => {
    const sessionToken = extractSessionTokenFromRequest(request);

    if (!sessionToken) {
      throw new NotAuthorizedError('No session token given');
    }

    const sessionWithUser = authService.authenticate(sessionToken);

    request.currentSessionId = sessionWithUser.id;
    request.currentUser = sessionWithUser.user;
  };
}

function extractSessionTokenFromRequest(
  request: FastifyRequest,
): string | undefined {
  const cookies = extractCookiesFromRequest(request);

  return cookies['id'];
}

function extractCookiesFromRequest(
  request: FastifyRequest,
): Record<string, string> {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return {};
  }

  const keyValuePairs = cookieHeader.split(/; */);

  const cookies: Record<string, string> = {};

  for (const pair of keyValuePairs) {
    const [name, value] = pair.split('=');

    cookies[name] = value;
  }

  return cookies;
}
