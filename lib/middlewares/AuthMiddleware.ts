import { FastifyRequest } from 'fastify';

import { AuthContext } from '@/typings/AuthContext';
import { sendNotAuthorizedError } from '@/helpers/responses';

import { Middleware } from './Middleware';

type User = {
  id: string;
  username: string;
  displayName: string;
};

type UserWithPassword = User & {
  password: string;
};

type SessionWithUser = {
  id: string;
  user: UserWithPassword;
};

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthContext;
  }
}

interface SessionsService {
  findWithUserByToken(
    sessionToken: string,
  ): Promise<SessionWithUser | undefined>;
}

type Injects = {
  sessionsService: SessionsService;
  comparePasswords(password: string, hashedPassword: string): boolean;
};

export function createAuthMiddleware({
  comparePasswords,
  sessionsService,
}: Injects): Middleware {
  return async function (request, reply) {
    const sessionToken = extractSessionTokenFromRequest(request);

    if (!sessionToken) {
      return sendNotAuthorizedError(reply, 'No session token given');
    }

    const session = await sessionsService.findWithUserByToken(sessionToken);

    if (!session) {
      return sendNotAuthorizedError(reply, 'Invalid or expired session');
    }

    const authContext = createAuthContext(comparePasswords, session);

    request.auth = authContext;
  };
}

function createAuthContext(
  comparePasswords: (password: string, hashedPassword: string) => boolean,
  session: SessionWithUser,
): AuthContext {
  return {
    getUser() {
      const { id, username, displayName } = session.user;

      return {
        id,
        username,
        displayName,
      };
    },

    getUserId() {
      return session.user.id;
    },

    getSessionId() {
      return session.id;
    },

    isValidPassword(password) {
      return comparePasswords(password, session.user.password);
    },
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
