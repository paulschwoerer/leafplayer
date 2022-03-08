import { Knex } from 'knex';

import { NotFoundError } from '~/errors/NotFoundError';
import { FullSong } from '~/common';
import { toFullSong } from '~/mappers/songs';
import { createSongsQuery, orderByDiscAndTrack } from '~/query/songs';
import { SongRow } from '~/database/rows';
import { createNamespacedWhereParams } from '~/helpers/db';

type Injects = {
  db: Knex;
};

export interface SongsService {
  findById(id: string): Promise<FullSong>;
  findAllWhere(params: Partial<SongRow>): Promise<FullSong[]>;
}

export default function createSongsService({ db }: Injects): SongsService {
  return {
    async findById(id) {
      const row = await createSongsQuery(db).where('songs.id', id).first();

      if (!row) {
        throw new NotFoundError(`song with id '${id}' does not exist`);
      }

      return toFullSong(row);
    },

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
