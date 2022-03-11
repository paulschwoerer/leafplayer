import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { JwtService } from '@/services/JwtService';
import { UserResponseDto } from '@/common';

type Injects = {
  jwtService: JwtService;
};

export function currentUser({ jwtService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/auth/user',
      {
        preHandler: server.auth([server.verifySession]),
      },
      async ({ currentUser }): Promise<UserResponseDto> => {
        const artworkToken = jwtService.makeJwtToken();

        return { user: currentUser, artworkToken };
      },
    );
  });
}
