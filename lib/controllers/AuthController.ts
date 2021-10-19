import { FastifyPluginAsync } from 'fastify';
import { UAParser } from 'ua-parser-js';

import {
  AuthRequestDto,
  ChangePasswordRequestDto,
  RegisterRequestDto,
  UserResponseDto,
} from '@/common';
import { AuthService } from '@/services/AuthService';
import {
  sendBadRequestError,
  sendNotAuthorizedError,
} from '@/helpers/responses';
import ChangePasswordSchema from '@/schemas/changePassword.json';
import LoginSchema from '@/schemas/login.json';
import RegisterSchema from '@/schemas/register.json';
import { InvitationsService } from '@/services/InvitationsService';
import { Middleware } from '@/middlewares/Middleware';

type Config = {
  minimumPasswordLength: number;
  sessionMaxAge: number;
  secret: string;
};

type Injects = {
  authService: AuthService;
  invitationsService: InvitationsService;
  authMiddleware: Middleware;
  config: Config;
};

export function AuthController({
  config,
  authService,
  invitationsService,
  authMiddleware,
}: Injects): FastifyPluginAsync {
  function bakeAuthCookie(sessionToken: string, stayLoggedIn: boolean): string {
    const cookieString = `id=${sessionToken}; ${
      process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
    }SameSite=Lax; HttpOnly; Path=/api`;

    if (stayLoggedIn) {
      return `${cookieString}; Max-Age=${config.sessionMaxAge}`;
    }

    return cookieString;
  }

  function bakeLogoutCookie(): string {
    return `id=; Expires=01 Jan 1970`;
  }

  return async function (router) {
    router.post<{ Body: AuthRequestDto }>(
      '/login',
      { schema: LoginSchema },
      async (request, reply) => {
        const { stayLoggedIn, ...credentials } = request.body;

        const browserInfo = extractBrowserFromUserAgent(
          request.headers['user-agent'],
        );

        const result = await authService.authenticate(credentials, browserInfo);

        if (result instanceof Error) {
          return reply.status(401).send(result);
        }

        const { user, sessionToken } = result;

        return reply
          .header('Set-Cookie', bakeAuthCookie(sessionToken, !!stayLoggedIn))
          .send({
            user,
            artworkToken: authService.makeJwtToken(),
          });
      },
    );

    router.get(
      '/user',
      { preValidation: authMiddleware },
      async ({ auth }): Promise<UserResponseDto> => {
        const artworkToken = authService.makeJwtToken();

        return { user: auth.getUser(), artworkToken };
      },
    );

    router.post<{ Body: ChangePasswordRequestDto }>(
      '/password',
      { schema: ChangePasswordSchema, preValidation: authMiddleware },
      async (request, reply) => {
        const { currentPassword, newPassword } = request.body;

        if (!request.auth.isValidPassword(currentPassword)) {
          return sendNotAuthorizedError(
            reply,
            'incorrect current password given',
          );
        }

        const result = await authService.changeUserPassword({
          activeSessionId: request.auth.getSessionId(),
          newPassword,
          userId: request.auth.getUserId(),
        });

        if (result instanceof Error) {
          return sendBadRequestError(reply, result.message);
        }

        return reply.status(204).send();
      },
    );

    router.post<{ Body: RegisterRequestDto }>(
      '/register',
      { schema: RegisterSchema },
      async (request, reply) => {
        const { username, password, displayName, inviteCode } = request.body;

        const result = await invitationsService.createUserUsingInviteCode(
          inviteCode,
          {
            username,
            displayName,
            password,
          },
        );

        if (result instanceof Error) {
          return reply.status(400).send(result);
        }

        return reply.status(201).send();
      },
    );

    router.post(
      '/logout',
      { preValidation: authMiddleware },
      async (request, reply) => {
        const currentSessionId = request.auth.getSessionId();

        await authService.logout(currentSessionId);

        return reply
          .status(204)
          .header('Set-Cookie', bakeLogoutCookie())
          .send();
      },
    );
  };
}

type Browser = {
  name: string;
  os: string;
};

function extractBrowserFromUserAgent(userAgent?: string | undefined): Browser {
  const parser = new UAParser(userAgent);

  return {
    name: parser.getBrowser().name || 'unknown',
    os: parser.getOS().name || 'unknown',
  };
}
