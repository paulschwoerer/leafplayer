import { Knex } from 'knex';

import { FullSong } from '@/common';
import { toFullSong } from '@/mappers/songs';
import { createSongsQuery, orderByDiscAndTrack } from '@/query/songs';
import { SongRow } from '@/database/rows';
import { createNamespacedWhereParams } from '@/helpers/db';

type Injects = {
  db: Knex;
};

export interface SongsService {
  findAllWhere(params: Partial<SongRow>): Promise<FullSong[]>;
}

export function createSongsService({ db }: Injects): SongsService {
  return {
    async findAllWhere(params) {
      const orderedByDiskAndTrack = orderByDiscAndTrack();
      const rows = await orderedByDiskAndTrack(
        createSongsQuery(db).where(
          createNamespacedWhereParams('songs', params),
        ),
      );

      return rows.map(toFullSong);
    },
  };
}
