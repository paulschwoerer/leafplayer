import { FullSong } from '@common';
import { createSongsQuery, orderByDiscAndTrack } from '@query/songs';
import Knex from 'knex';
import { SongRow } from '../database/rows';
import { createNamespacedWhereParams } from '../helpers/db';
import { weighStringsUsingSearchTerm } from '../helpers/search';

type Injects = {
  db: Knex;
};

export interface SongsService {
  search(q: string, count: number): Promise<FullSong[]>;
  findAllWhere(params: Partial<SongRow>): Promise<FullSong[]>;
}

type Row = Omit<SongRow, 'fileId'> & {
  artistName: string;
  albumName: string;
};

function toFullSong({
  artistName,
  albumName,
  artistId,
  albumId,
  track,
  ...rest
}: Row) {
  return {
    ...rest,
    track: track || undefined,
    album: {
      id: albumId,
      name: albumName,
    },
    artist: {
      id: artistId,
      name: artistName,
    },
  };
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

    async search(q, count) {
      const rows = await createSongsQuery(db)
        .where('songs.title', 'like', `%${q}%`)
        .orWhere('artists.name', 'like', `%${q}%`)
        .orWhere('albums.name', 'like', `%${q}%`);

      const weightedRows = rows.sort((a: Row, b: Row): number => {
        return weighStringsUsingSearchTerm(q, a.title, b.title);
      });

      return weightedRows.slice(0, count).map(toFullSong);
    },
  };
}
