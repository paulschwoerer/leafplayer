import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { CreateShareRequestDto, CreateShareResponseDto } from '@/common';
import { SharesService } from '@/services/SharesService';

type Injects = {
  sharesService: SharesService;
};

const schema = {
  body: {
    type: 'object',
    properties: {
      forType: {
        enum: ['album', 'artist', 'song'],
      },
      forId: {
        type: 'string',
      },
    },
    required: ['forType', 'forId'],
  },
};

export function createShare({ sharesService }: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.post<{ Body: CreateShareRequestDto }>(
      '/shares',
      { schema, preHandler: server.auth([server.verifySession]) },
      async ({ body, currentUser }): Promise<CreateShareResponseDto> => {
        const { forType, forId, note } = body;

        const share = await sharesService.create({
          forType,
          forId,
          userId: currentUser.id,
          note,
        });

        return {
          share,
        };
      },
    );
  });
}
