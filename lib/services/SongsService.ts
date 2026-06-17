import { FullSong } from '@/common';

import { NotFoundError } from '../errors/NotFoundError.ts';
import { toFullSong } from '../mappers/songs.ts';
import { prepareSongsQuery } from '../query/songs.ts';
import { DB } from '../database/index.ts';

type Injects = {
  db: DB;
};

export interface SongsService {
  findById(id: string): FullSong;
}

export default function createSongsService({ db }: Injects): SongsService {
  return {
    findById(id) {
      const row = prepareSongsQuery(db, 'WHERE songs.id = ?').first(id);

      if (!row) {
        throw new NotFoundError(`song with id '${id}' does not exist`);
      }

      return toFullSong(row);
    },
  };
}
