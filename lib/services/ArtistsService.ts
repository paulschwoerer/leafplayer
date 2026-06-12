import { FullAlbum, FullArtist, FullSong } from '@/common';
import { toFullAlbum } from '@/mappers/albums';
import { toFullArtist } from '@/mappers/artists';
import { prepareAlbumsQuery } from '@/query/albums';
import { prepareArtistsQuery } from '@/query/artists';
import { SortParam } from '@/typings/SortParam';
import { generateUuid } from '@/helpers/uuid';
import { NotFoundError } from '@/errors/NotFoundError';
import { DB } from '@/database';
import { prepareSongsQuery } from '@/query/songs';
import { toFullSong } from '@/mappers/songs';

import { AlbumsService } from './AlbumsService';

type ArtistWithAlbums = {
  artist: FullArtist;
  albums: {
    album: FullAlbum;
    songs: FullSong[];
  }[];
  appearsOn: FullAlbum[];
};

export interface ArtistsService {
  find(sort?: SortParam): FullArtist[];
  findById(id: string): FullArtist;
  create(params: { name: string }): string;
  findIdByName(name: string): string | undefined;
  findAllSongsByArtist(id: string): FullSong[];
  findByIdWithAlbums(id: string): ArtistWithAlbums;
  getAlbumsOfArtist(artistId: string): FullAlbum[];
  getAlbumsArtistAppearsOn(artistId: string): FullAlbum[];
}

type Injects = {
  db: DB;
  albumsService: AlbumsService;
};

const DEFAULT_SORT: SortParam = {
  field: 'name',
  direction: 'asc',
};

export default function createArtistsService({
  db,
  albumsService,
}: Injects): ArtistsService {
  return {
    find(sort) {
      const { field, direction } = sort || DEFAULT_SORT;

      const rows = prepareArtistsQuery(
        db,
        `GROUP BY artists.id ORDER BY artists.${field} ${direction}`,
      ).all();
      return rows.map(toFullArtist);
    },

    findById(id) {
      const row = prepareArtistsQuery(db, 'WHERE artists.id = ?').first(id);

      if (!row) {
        throw new NotFoundError(`artist with id '${id}' does not exist`);
      }

      return toFullArtist(row);
    },

    create(params) {
      const id = generateUuid();

      db.prepare('INSERT INTO artists (id, name) VALUES (:id, :name)').run({
        ...params,
        id,
      });

      return id;
    },

    findAllSongsByArtist(id) {
      const rows = prepareSongsQuery<string>(
        db,
        `WHERE artistId = ? ORDER BY songs.disk ASC, songs.track ASC`,
      ).all(id);

      return rows.map(toFullSong);
    },

    findByIdWithAlbums(id) {
      const artist = this.findById(id);
      const albums = this.getAlbumsOfArtist(id);
      const appearsOn = this.getAlbumsArtistAppearsOn(id);

      const albumsWithSongs = albums.map(album => {
        const songs = albumsService.findSongsOfAlbum(album.id);

        return {
          album,
          songs,
        };
      });

      return {
        artist,
        albums: albumsWithSongs,
        appearsOn,
      };
    },

    getAlbumsOfArtist(artistId) {
      const rows = prepareAlbumsQuery(
        db,
        'WHERE albums.artistId = ? ORDER BY albums.year DESC',
      ).all(artistId);

      return rows.map(toFullAlbum);
    },

    getAlbumsArtistAppearsOn(artistId) {
      const rows = prepareAlbumsQuery<{ artistId: string }>(
        db,
        `
        INNER JOIN songs
          ON albums.id = songs.albumId
        WHERE songs.artistId = :artistId
          AND albums.artistId != :artistId
        GROUP BY albums.id
        ORDER BY albums.year DESC
      `,
      ).all({ artistId });

      return rows.map(toFullAlbum);
    },

    findIdByName(name) {
      const row = db
        .prepare<string, { id: string }>(
          'SELECT id FROM artists WHERE name = ?',
        )
        .first(name);

      if (!row) {
        return undefined;
      }

      return row.id;
    },
  };
}
