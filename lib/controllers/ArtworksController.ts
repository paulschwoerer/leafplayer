import { FastifyPluginAsync } from 'fastify';
import { Stream } from 'stream';
import { sendNotFoundError } from '@/helpers/responses';
import { isUuidV4 } from '@/helpers/uuid';
import GetArtworkSchema from '@/schemas/getArtwork.json';

type ArtworkStream = {
  size: number;
  stream: Stream;
};

interface ArtworksService {
  createArtworkStream(
    type: string,
    id: string,
    size: number,
  ): Promise<ArtworkStream | Error>;
}

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
  artworksService: artworksStreamer,
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
          return reply.status(400).send('given ID seems to be invalid');
        }

        const result = await artworksStreamer.createArtworkStream(
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
