import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { FastifyAuthFunction } from 'fastify-auth';

import { AuthService } from '@/services/AuthService';
import { NotAuthorizedError } from '@/errors/NotAuthorizedError';
import { User } from '@/common';

declare module 'fastify' {
  interface FastifyInstance {
    verifySession: FastifyAuthFunction;
  }

  interface FastifyRequest {
    currentSessionId: string;
    currentUser: User;
  }
}

type Injects = {
  authService: AuthService;
};

export function createSessionAuthPlugin({
  authService,
}: Injects): FastifyPluginAsync {
  return fp(async function (server) {
    server.decorate<FastifyAuthFunction>(
      'verifySession',
      async function hook(request): Promise<void> {
        const sessionToken = extractSessionTokenFromRequest(request);

        if (!sessionToken) {
          throw new NotAuthorizedError('No session token given');
        }

        const sessionWithUser = await authService.authenticate(sessionToken);

        request.currentSessionId = sessionWithUser.id;
        request.currentUser = sessionWithUser.user;
      },
    );
  });
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
