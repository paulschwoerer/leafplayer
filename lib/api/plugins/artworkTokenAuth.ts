import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { FastifyAuthFunction } from 'fastify-auth';

import { NotAuthorizedError } from '@/errors/NotAuthorizedError';
import { ValidationError } from '@/errors/ValidationError';
import { JwtService } from '@/services/JwtService';

declare module 'fastify' {
  interface FastifyInstance {
    verifyArtworkToken: FastifyAuthFunction;
  }
}

type Injects = {
  jwtService: JwtService;
};

type TokenParams = { Querystring: { token?: string } };

export function createArtworkTokenAuthPlugin({
  jwtService,
}: Injects): FastifyPluginAsync {
  return fp(async function (server) {
    server.decorate(
      'verifyArtworkToken',
      async (request: FastifyRequest<TokenParams>) => {
        const token = request.query.token;

        if (!token || !token.length) {
          throw new ValidationError('an artwork token is required');
        }

        if (!jwtService.isValidJwtToken(token)) {
          throw new NotAuthorizedError('artwork token seems to be invalid');
        }
      },
    );
  });
}
