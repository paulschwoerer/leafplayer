import { FastifyPluginAsync } from 'fastify';
import UAParser from 'ua-parser-js';

import ChangePasswordSchema from '@/schemas/changePassword.json';
import LoginSchema from '@/schemas/login.json';
import {
  AuthRequestDto,
  ChangePasswordRequestDto,
  UserResponseDto,
} from '@/common';
import { AuthService } from '@/services/AuthService';
import { JwtService } from '@/services/JwtService';
import { LeafplayerConfig } from '@/config';

type Injects = {
  config: LeafplayerConfig;
  jwtService: JwtService;
  authService: AuthService;
};

export function createAuthController({
  config,
  jwtService,
  authService,
}: Injects): FastifyPluginAsync {
  return async server => {
    server.post<{ Body: AuthRequestDto }>(
      '/login',
      { schema: LoginSchema },
      async (request, reply) => {
        const { stayLoggedIn, ...credentials } = request.body;

        const browserInfo = extractBrowserFromUserAgent(
          request.headers['user-agent'],
        );

        const result = await authService.login(credentials, browserInfo);

        const { user, sessionToken } = result;

        return reply
          .header(
            'Set-Cookie',
            bakeLoginCookie(
              sessionToken,
              stayLoggedIn ? config.security.sessionMaxAge : undefined,
            ),
          )
          .send({
            user,
            artworkToken: jwtService.makeJwtToken(),
          });
      },
    );

    server.get(
      '/user',
      {
        preHandler: server.auth([server.verifyAuth]),
      },
      async ({ currentUser }): Promise<UserResponseDto> => {
        const artworkToken = jwtService.makeJwtToken();

        return { user: currentUser, artworkToken };
      },
    );

    server.post<{ Body: ChangePasswordRequestDto }>(
      '/password',
      {
        preHandler: server.auth([server.verifyAuth, server.verifyPassword], {
          relation: 'and',
        }),
        schema: ChangePasswordSchema,
      },
      async (
        { currentUser, currentSessionId, body: { newPassword } },
        reply,
      ) => {
        await authService.changePassword({
          userId: currentUser.id,
          activeSessionId: currentSessionId,
          newPassword,
        });

        return reply.status(204).send();
      },
    );

    server.post(
      '/logout',
      { preHandler: server.auth([server.verifyAuth]) },
      async ({ currentSessionId }, reply) => {
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

function bakeLogoutCookie(): string {
  return `id=; Expires=01 Jan 1970`;
}

function bakeLoginCookie(sessionToken: string, maxAge?: number) {
  const cookieString = `id=${sessionToken}; ${
    process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  }SameSite=Lax; HttpOnly; Path=/api`;

  if (maxAge) {
    return `${cookieString}; Max-Age=${maxAge}`;
  }

  return cookieString;
}
