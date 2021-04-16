import Knex from 'knex';
import { FullSong } from '@common';
import { SongRow } from '../database/rows';
import { createNamespacedWhereParams } from '../helpers/db';
import { weighStringsUsingSearchTerm } from '../helpers/search';

type Injects = {
  db: Knex;
};

export interface SongsService {
  search(q: string, count: number): Promise<FullSong[]>;
  findAllWhere(
    params: Partial<SongRow>,
    sortBy?: keyof SongRow,
    sortDirection?: 'asc' | 'desc',
  ): Promise<FullSong[]>;
}

function createSongsQuery(
  db: Knex,
  sortBy?: keyof SongRow,
  sortDirection?: 'asc' | 'desc',
) {
  return db('songs')
    .select(
      db.ref('id').withSchema('songs'),
      db.ref('track').withSchema('songs'),
      db.ref('title').withSchema('songs'),
      db.ref('duration').withSchema('songs'),
      db.ref('artistId').withSchema('songs'),
      db.ref('albumId').withSchema('songs'),
      db.ref('name').as('albumName').withSchema('albums'),
      db.ref('name').as('artistName').withSchema('artists'),
    )
    .orderBy(`songs.${sortBy || 'title'}`, sortDirection || 'asc')
    .innerJoin('albums', 'songs.albumId', 'albums.id')
    .innerJoin('artists', 'songs.artistId', 'artists.id');
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
    async findAllWhere(params, sortBy, sortDirection) {
      const rows = await createSongsQuery(db, sortBy, sortDirection).where(
        createNamespacedWhereParams('songs', params),
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
