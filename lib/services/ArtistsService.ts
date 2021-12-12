import { Knex } from 'knex';

import { FullAlbum, FullArtist, FullSong } from '@/common';
import { toFullAlbum } from '@/mappers/albums';
import { toFullArtist } from '@/mappers/artists';
import { createAlbumsQuery, orderByYearDesc } from '@/query/albums';
import { createArtistQuery, orderBy } from '@/query/artists';
import { SortParam } from '@/typings/SortParam';
import { generateUuid } from '@/helpers/uuid';

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
  find(sort?: SortParam): Promise<FullArtist[]>;
  findById(id: string): Promise<FullArtist | undefined>;
  create(params: { name: string }): Promise<string>;
  findIdByName(name: string): Promise<string | undefined>;
  findAllSongsByArtist(id: string): Promise<FullSong[]>;
  findByIdWithAlbums(id: string): Promise<ArtistWithAlbums | undefined>;
  getAlbumsOfArtist(artistId: string): Promise<FullAlbum[]>;
  getAlbumsArtistAppearsOn(artistId: string): Promise<FullAlbum[]>;
}

type Injects = {
  db: Knex;
  albumsService: AlbumsService;
  songsService: SongsService;
};

const DEFAULT_SORT: SortParam = {
  field: 'name',
  direction: 'asc',
};

export default function createArtistsService({
  db,
  albumsService,
  songsService,
}: Injects): ArtistsService {
  return {
    async find(sort) {
      const ordered = orderBy(sort || DEFAULT_SORT);

      const rows = await ordered(createArtistQuery(db)).groupBy('artists.id');
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
      const rows = await createAlbumsQuery(db)
        .innerJoin('songs', 'albums.id', 'songs.albumId')
        .where('songs.artistId', artistId)
        .andWhereNot('albums.artistId', artistId)
        .orderBy('albums.year', 'desc')
        .groupBy('albums.id');

      return rows.map(toFullAlbum);
    },

    async findIdByName(name) {
      const row = await db('artists').select('id').where({ name }).first();

      if (!row) {
        return undefined;
      }

      return row.id;
    },
  };
}
