import { Knex } from 'knex';

import { FullAlbum, FullSong } from '@/common';
import { toFullAlbum } from '@/mappers/albums';
import { createAlbumsQuery, orderBy } from '@/query/albums';
import { SortParam } from '@/typings/SortParam';
import { generateUuid } from '@/helpers/uuid';
import { NotFoundError } from '@/errors/NotFoundError';

import { SongsService } from './SongsService';

export interface AlbumsService {
  createAlbum(params: {
    name: string;
    artistId: string;
    year?: number;
  }): Promise<string>;
  findById(id: string): Promise<FullAlbum>;
  find(sort?: SortParam): Promise<FullAlbum[]>;
  findSongsOfAlbum(albumId: string): Promise<FullSong[]>;
  findIdByNameAndArtistId(params: {
    name: string;
    artistId: string;
  }): Promise<string | undefined>;
}

type Injects = {
  db: Knex;
  songsService: SongsService;
};

const DEFAULT_SORT: SortParam = {
  field: 'name',
  direction: 'asc',
};

export default function createAlbumsService({
  db,
  songsService,
}: Injects): AlbumsService {
  return {
    async createAlbum(params) {
      const id = generateUuid();

      await db('albums').insert({
        ...params,
        year: params.year || null,
        id,
      });

      return id;
    },

    async findById(id) {
      const row = await createAlbumsQuery(db).where('albums.id', id).first();

      if (!row) {
        throw new NotFoundError();
      }

      return toFullAlbum(row);
    },

    async find(sort) {
      const ordered = orderBy(sort || DEFAULT_SORT);
      const rows = await ordered(createAlbumsQuery(db).where(true));

      return rows.map(toFullAlbum);
    },

    async findSongsOfAlbum(albumId) {
      return songsService.findAllWhere({ albumId });
    },

    async findIdByNameAndArtistId(params): Promise<string | undefined> {
      const row = await db('albums').select('id').where(params).first();

      if (!row) {
        return undefined;
      }

      return row.id;
    },
  };
}
