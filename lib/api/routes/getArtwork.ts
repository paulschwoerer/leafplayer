import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { ArtworksService } from '../../services/ArtworksService.ts';
import { NotFoundError } from '../../errors/NotFoundError.ts';
import { ValidationError } from '../../errors/ValidationError.ts';
import { isUuidV4 } from '../../helpers/uuid.ts';
import { JwtService } from '../../services/JwtService.ts';
import { verifyArtworkToken } from '../artworkTokenAuth.ts';

type Injects = {
  artworksService: ArtworksService;
  jwtService: JwtService;
};

const schema = {
  querystring: {
    type: 'object',
    properties: {
      size: {
        enum: ['96', '128', '192', '256', '384', '512'],
      },
    },
  },
};

export function getArtwork({
  artworksService,
  jwtService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.get<{
      Params: { id: string; type: string };
      Querystring: { size: string; token?: string };
    }>(
      '/artwork/:type/:id',
      {
        schema,
        preHandler: verifyArtworkToken(jwtService),
      },
      async (request, reply) => {
        const { type, id } = request.params;
        const { size } = request.query;

        if (!['album', 'artist'].includes(type)) {
          throw new NotFoundError();
        }

        if (!isUuidV4(id)) {
          throw new ValidationError('given ID seems to be invalid');
        }

        const result = await artworksService.createArtworkStream(
          type,
          id,
          parseArtworkSize(size),
        );

        if (result instanceof Error) {
          throw new NotFoundError();
        }

        return reply
          .headers({
            'Content-Type': 'image/jpeg',
            'Content-Length': result.size,
          })
          .send(result.stream);
      },
    );
  });
}

function parseArtworkSize(stringSize: string | undefined): number {
  if (!stringSize) {
    return 96;
  }

  return parseInt(stringSize);
}
