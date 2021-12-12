import { FastifyPluginAsync } from 'fastify';

import { isUuidV4 } from '@/helpers/uuid';
import GetArtworkSchema from '@/schemas/getArtwork.json';
import { ArtworksService } from '@/services/ArtworksService';
import { ValidationError } from '@/errors/ValidationError';
import { NotFoundError } from '@/errors/NotFoundError';

type Injects = {
  artworksService: ArtworksService;
};

export function createArtworksController({
  artworksService,
}: Injects): FastifyPluginAsync {
  return async function (server) {
    server.addHook('preHandler', server.auth([server.verifyTokenAuth]));

    server.get<{
      Params: { id: string; type: string };
      Querystring: { size: string };
    }>(
      '/:type/:id',
      {
        schema: GetArtworkSchema,
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
  };
}

function parseArtworkSize(stringSize: string | undefined): number {
  if (!stringSize) {
    return 96;
  }

  return parseInt(stringSize);
}
