import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { UserResponseDto } from 'leafplayer-common';

import { JwtService } from '../../../services/JwtService.ts';

type Injects = {
  jwtService: JwtService;
};

export function currentUser({ jwtService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get(
      '/auth/user',
      async ({ currentUser }): Promise<UserResponseDto> => {
        const artworkToken = jwtService.makeJwtToken();

        return { user: currentUser, artworkToken };
      },
    );
  });
}
