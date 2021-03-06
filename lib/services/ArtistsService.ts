import { FullAlbum, FullArtist, FullSong } from '@common';
import { toFullAlbum } from '@mappers/albums';
import { toFullArtist } from '@mappers/artists';
import { createAlbumsQuery, orderByYearDesc } from '@query/albums';
import { createArtistQuery, orderByName } from '@query/artists';
import Knex from 'knex';
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
  search(q: string, count: number): Promise<FullArtist[]>;
}

type Injects = {
  db: Knex;
  albumsService: AlbumsService;
  songsService: SongsService;
};

export function createArtistsService({
  db,
  albumsService,
  songsService,
}: Injects): ArtistsService {
  return {
    async findAll() {
      const orderedByName = orderByName();
      const rows = await orderedByName(createArtistQuery(db)).groupBy(
        'artists.id',
      );

      return rows.map(toFullArtist);
    },

    async findById(id) {
      const row = await createArtistQuery(db).where('artists.id', id).first();

      if (!row) {
        return undefined;
      }

      return toFullArtist(row);
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
      const orderedByYearDesc = orderByYearDesc();
      const rows = await orderedByYearDesc(
        createAlbumsQuery(db).where('albums.artistId', artistId),
      );

      return rows.map(toFullAlbum);
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

    async search(q, count) {
      const rows = await createArtistQuery(db)
        .groupBy('artists.id')
        .orWhereRaw('artists.name LIKE ?', [`%${q}%`]);

      const weightedRows = rows.sort((a, b): number => {
        return weighStringsUsingSearchTerm(q, a.name, b.name);
      });

      return weightedRows.slice(0, count).map(toFullArtist);
    },
  };
}
