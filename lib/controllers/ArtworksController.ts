import { FastifyPluginAsync } from 'fastify';

import { sendBadRequestError, sendNotFoundError } from '@/helpers/responses';
import { isUuidV4 } from '@/helpers/uuid';
import GetArtworkSchema from '@/schemas/getArtwork.json';
import { ArtworksService } from '@/services/ArtworksService';

type Injects = {
  artworksService: ArtworksService;
};

function parseArtworkSize(stringSize: string | undefined): number {
  if (!stringSize) {
    return 96;
  }

  return parseInt(stringSize);
}

export function ArtworksController({
  artworksService,
}: Injects): FastifyPluginAsync {
  return async function (router) {
    router.get<{
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
          return sendNotFoundError(reply);
        }

        if (!isUuidV4(id)) {
          return sendBadRequestError(reply, 'given ID seems to be invalid');
        }

        const result = await artworksService.createArtworkStream(
          type,
          id,
          parseArtworkSize(size),
        );

        if (result instanceof Error) {
          return sendNotFoundError(reply);
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
