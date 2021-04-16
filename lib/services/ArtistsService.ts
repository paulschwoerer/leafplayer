import Knex from 'knex';
import { FullAlbum, FullArtist, FullSong } from '@common';
import { findRandomIdsOfTable } from '../helpers/random';
import { weighStringsUsingSearchTerm } from '../helpers/search';
import { generateUuid } from '../helpers/uuid';
import { AlbumsService } from './AlbumsService';
import { SongsService } from './SongsService';

type ArtistWithAlbums = {
  artist: FullArtist;
  albums: {
    album: FullAlbum;
    songs: FullSong[];
  }[];
  appearsOn: FullAlbum[];
};

export interface ArtistsService {
  findAll(): Promise<FullArtist[]>;
  findById(id: string): Promise<FullArtist | undefined>;
  create(params: { name: string }): Promise<string>;
  findIdByName(name: string): Promise<string | undefined>;
  findAllSongsByArtist(id: string): Promise<FullSong[]>;
  findByIdWithAlbums(id: string): Promise<ArtistWithAlbums | undefined>;
  getAlbumsOfArtist(artistId: string): Promise<FullAlbum[]>;
  getAlbumsArtistAppearsOn(artistId: string): Promise<FullAlbum[]>;
  findRandomArtists(count: number): Promise<FullArtist[]>;
  search(q: string, count: number): Promise<FullArtist[]>;
}

type Injects = {
  db: Knex;
  albumsService: AlbumsService;
  songsService: SongsService;
};

function createArtistQuery(db: Knex) {
  return db('artists')
    .select(
      db.ref('id').withSchema('artists'),
      db.ref('name').withSchema('artists'),
    )
    .leftJoin('albums', 'albums.artistId', 'artists.id')
    .leftJoin('songs', 'songs.artistId', 'artists.id')
    .orderBy('artists.name', 'asc')
    .countDistinct({ songCount: 'songs.id', albumCount: 'albums.id' });
}

function withFallbackCounts(row: {
  id: string;
  name: string;
  albumCount?: number;
  songCount?: number;
}) {
  return {
    ...row,
    albumCount: row.albumCount || 0,
    songCount: row.songCount || 0,
  };
}

export function createArtistsService({
  db,
  albumsService,
  songsService,
}: Injects): ArtistsService {
  return {
    async findAll() {
      const rows = await createArtistQuery(db).groupBy('artists.id');

      return rows.map(withFallbackCounts);
    },

    async findById(id) {
      const row = await createArtistQuery(db).where('artists.id', id).first();

      if (!row) {
        return undefined;
      }

      return withFallbackCounts(row);
    },

    async create(params) {
      const id = generateUuid();

      await db('artists').insert({
        ...params,
        id,
      });

      return id;
    },

    async findAllSongsByArtist(id) {
      return songsService.findAllWhere({ artistId: id });
    },

    async findByIdWithAlbums(id) {
      const artist = await this.findById(id);

      if (!artist) {
        return undefined;
      }

      const [albums, appearsOn] = await Promise.all([
        this.getAlbumsOfArtist(id),
        this.getAlbumsArtistAppearsOn(id),
      ]);

      const albumsWithSongs = await Promise.all(
        albums.map(async album => {
          const songs = await albumsService.findSongsOfAlbum(album.id);

          return {
            album,
            songs,
          };
        }),
      );

      return {
        artist,
        albums: albumsWithSongs,
        appearsOn,
      };
    },

    async getAlbumsOfArtist(artistId) {
      return albumsService.findAllWhere({ artistId }, 'year', 'desc');
    },

    async getAlbumsArtistAppearsOn(artistId) {
      const rows = await db('songs')
        .select(
          db.ref('id').withSchema('albums'),
          db.ref('name').withSchema('albums'),
          db.ref('year').withSchema('albums'),
          db.ref('id').as('artistId').withSchema('artists'),
          db.ref('name').as('artistName').withSchema('artists'),
        )
        .join('albums', 'songs.albumId', 'albums.id')
        .join('artists', 'albums.artistId', 'artists.id')
        .where('songs.artistId', artistId)
        .andWhereNot('albums.artistId', artistId)
        .orderBy('albums.year', 'desc')
        .groupBy('albums.id');

      return rows.map(({ artistId, artistName, year, ...rest }) => ({
        ...rest,
        artist: {
          id: artistId,
          name: artistName,
        },
        year: year || undefined,
      }));
    },

    async findIdByName(name) {
      const row = await db('artists').select('id').where({ name }).first();

      if (!row) {
        return undefined;
      }

      return row.id;
    },

    async findRandomArtists(count) {
      const randomIds = await findRandomIdsOfTable(db, 'artists', count);

      const rows = await createArtistQuery(db)
        .whereIn('artists.id', randomIds)
        .groupBy('artists.id');

      return rows.map(withFallbackCounts);
    },

    async search(q, count) {
      const rows = await createArtistQuery(db)
        .groupBy('artists.id')
        .orWhereRaw('artists.name LIKE ?', [`%${q}%`]);

      const weightedRows = rows.sort((a, b): number => {
        return weighStringsUsingSearchTerm(q, a.name, b.name);
      });

      return weightedRows.slice(0, count).map(withFallbackCounts);
    },
  };
}
