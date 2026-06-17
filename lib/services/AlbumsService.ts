import type { FullAlbum, FullSong } from 'leafplayer-common';

import { toFullAlbum } from '../mappers/albums.ts';
import { prepareAlbumsQuery } from '../query/albums.ts';
import { type SortParam } from '../typings/SortParam.ts';
import { generateUuid } from '../helpers/uuid.ts';
import { NotFoundError } from '../errors/NotFoundError.ts';
import { type DB } from '../database/index.ts';
import { toFullSong } from '../mappers/songs.ts';
import { prepareSongsQuery } from '../query/songs.ts';

export interface AlbumsService {
  createAlbum(params: {
    name: string;
    artistId: string;
    year?: number;
  }): string;
  findById(id: string): FullAlbum;
  find(sort?: SortParam): FullAlbum[];
  findSongsOfAlbum(albumId: string): FullSong[];
  findIdByNameAndArtistId(params: {
    name: string;
    artistId: string;
  }): string | undefined;
}

type Injects = {
  db: DB;
};

const DEFAULT_SORT: SortParam = {
  field: 'name',
  direction: 'asc',
};

export default function createAlbumsService({ db }: Injects): AlbumsService {
  return {
    createAlbum(params) {
      const id = generateUuid();

      db.prepare(
        'INSERT INTO albums (id, name, artistId, year) VALUES (:id, :name, :artistId, :year)',
      ).run({
        ...params,
        year: params.year || null,
        id,
      });

      return id;
    },

    findById(id) {
      const row = prepareAlbumsQuery(db, 'WHERE albums.id = ?').first(id);

      if (!row) {
        throw new NotFoundError(`album with id '${id}' does not exist`);
      }

      return toFullAlbum(row);
    },

    find(sort) {
      const { field, direction } = sort || DEFAULT_SORT;
      const rows = prepareAlbumsQuery(
        db,
        `ORDER BY albums.${field} ${direction}`,
      ).all();

      return rows.map(toFullAlbum);
    },

    findSongsOfAlbum(albumId) {
      const rows = prepareSongsQuery<string>(
        db,
        `WHERE albumId = ? ORDER BY songs.disk ASC, songs.track ASC`,
      ).all(albumId);

      return rows.map(toFullSong);
    },

    findIdByNameAndArtistId(params): string | undefined {
      const row = db
        .prepare<{ name: string; artistId: string }, { id: string }>(
          'SELECT id FROM albums WHERE name = :name AND artistId = :artistId',
        )
        .first(params);

      if (!row) {
        return undefined;
      }

      return row.id;
    },
  };
}
