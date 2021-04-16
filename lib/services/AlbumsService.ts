import Knex from 'knex';
import { FullAlbum, FullSong } from '@common';
import { AlbumRow } from '../database/rows';
import { findRandomIdsOfTable } from '../helpers/random';
import { weighStringsUsingSearchTerm } from '../helpers/search';
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
  findAllWhere(
    params: Partial<AlbumRow>,
    sortBy?: keyof AlbumRow,
    sortDirection?: 'asc' | 'desc',
  ): Promise<FullAlbum[]>;
  findSongsOfAlbum(albumId: string): Promise<FullSong[]>;
  findIdByNameAndArtistId(params: {
    name: string;
    artistId: string;
  }): Promise<string | undefined>;
  findRandomAlbums(count: number): Promise<FullAlbum[]>;
  search(q: string, count: number): Promise<FullAlbum[]>;
}

type Injects = {
  db: Knex;
  songsService: SongsService;
};

function createAlbumsQuery(
  db: Knex,
  sortBy?: keyof AlbumRow,
  sortDirection?: 'asc' | 'desc',
) {
  return db('albums')
    .select(
      db.ref('id').withSchema('albums'),
      db.ref('name').withSchema('albums'),
      db.ref('year').withSchema('albums'),
      db.ref('id').as('artistId').withSchema('artists'),
      db.ref('name').as('artistName').withSchema('artists'),
    )
    .orderBy(`albums.${sortBy || 'name'}`, sortDirection || 'asc')
    .innerJoin('artists', 'albums.artistId', 'artists.id');
}

function toFullAlbum({
  artistId,
  artistName,
  year,
  ...rest
}: AlbumRow & {
  artistName: string;
}) {
  return {
    ...rest,
    artist: {
      id: artistId,
      name: artistName,
    },
    year: year || undefined,
  };
}

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
      const rows = await createAlbumsQuery(db).where(true);

      return rows.map(toFullAlbum);
    },

    async findAllWhere(params, sortBy, sortDirection) {
      const rows = await createAlbumsQuery(db, sortBy, sortDirection).where(
        params,
      );

      return rows.map(toFullAlbum);
    },

    async findSongsOfAlbum(albumId) {
      return songsService.findAllWhere({ albumId }, 'track', 'asc');
    },

    async findIdByNameAndArtistId(params): Promise<string | undefined> {
      const row = await db('albums').select('id').where(params).first();

      if (!row) {
        return undefined;
      }

      return row.id;
    },

    async findRandomAlbums(count) {
      const randomIds = await findRandomIdsOfTable(db, 'albums', count);

      const albumRows = await createAlbumsQuery(db).whereIn(
        'albums.id',
        randomIds,
      );

      return albumRows.map(toFullAlbum);
    },

    async search(q, count) {
      type Row = AlbumRow & { artistName: string };

      const rows = await createAlbumsQuery(db)
        .whereRaw('albums.name LIKE ?', [`%${q}%`])
        .orWhereRaw('artists.name LIKE ?', [`%${q}%`]);

      const weightedRows = rows.sort((a: Row, b: Row): number => {
        return weighStringsUsingSearchTerm(q, a.name, b.name);
      });

      return weightedRows.slice(0, count).map(toFullAlbum);
    },
  };
}
