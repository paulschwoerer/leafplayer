import { FullAlbum, FullSong } from '@common';
import { toFullAlbum } from '@mappers/albums';
import { createAlbumsQuery, orderByName } from '@query/albums';
import Knex from 'knex';
import { generateUuid } from '../helpers/uuid';
import { SongsService } from './SongsService';

export interface AlbumsService {
  createAlbum(params: {
    name: string;
    artistId: string;
    year?: number;
  }): Promise<string>;
  findById(id: string): Promise<FullAlbum | undefined>;
  findAll(): Promise<FullAlbum[]>;
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

export function createAlbumsService({
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
        return undefined;
      }

      return toFullAlbum(row);
    },

    async findAll() {
      const orderedByName = orderByName();
      const rows = await orderedByName(createAlbumsQuery(db).where(true));

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
