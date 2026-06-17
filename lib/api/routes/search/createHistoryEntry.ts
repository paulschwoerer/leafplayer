import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import {
  CreateSearchHistoryEntryRequestDto,
  CreateSearchHistoryEntryResponseDto,
} from '@/common';

import { SearchHistoryService } from '../../../services/SearchHistoryService.ts';

type Injects = {
  searchHistoryService: SearchHistoryService;
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

export function createSearchHistoryEntry({
  searchHistoryService,
}: Injects): FastifyPluginAsync {
  return fp(async server => {
    server.post<{ Body: CreateSearchHistoryEntryRequestDto }>(
      '/search/history',
      { schema },
      async ({
        body,
        currentUser,
      }): Promise<CreateSearchHistoryEntryResponseDto> => {
        const { forType, forId } = body;

        const entry = searchHistoryService.createEntry({
          forType,
          forId,
          userId: currentUser.id,
        });

        return {
          entry,
        };
      },
    );
  });
}
