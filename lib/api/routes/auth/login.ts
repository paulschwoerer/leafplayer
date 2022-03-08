import UAParser from 'ua-parser-js';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { AuthRequestDto } from '~/common';
import { AuthService } from '~/services/AuthService';
import { LeafplayerConfig } from '~/config';
import { JwtService } from '~/services/JwtService';

type Injects = {
  config: LeafplayerConfig;
  jwtService: JwtService;
  authService: AuthService;
};

const schema = {
  body: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      stayLoggedIn: {
        type: 'boolean',
      },
    },
    required: ['username', 'password'],
  },
};

export function login({
  config,
  authService,
  jwtService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.post<{ Body: AuthRequestDto }>(
      '/auth/login',
      { schema },
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
  });
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

function bakeLoginCookie(sessionToken: string, maxAge?: number) {
  const cookieString = `id=${sessionToken}; ${
    process.env.NODE_ENV === 'production' ? 'Secure; ' : ''
  }SameSite=Lax; HttpOnly; Path=/api`;

  if (maxAge) {
    return `${cookieString}; Max-Age=${maxAge}`;
  }

  return cookieString;
}
