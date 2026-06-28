import type { FullAlbum, FullArtist } from 'leafplayer-common';

import { toFullAlbum } from '../mappers/albums.ts';
import { toFullArtist } from '../mappers/artists.ts';
import { prepareAlbumsQuery } from '../query/albums.ts';
import { prepareArtistsQuery } from '../query/artists.ts';
import { type DB } from '../database/index.ts';

export interface DiscoverService {
  findRandomArtists(count: number): FullArtist[];
  findRandomAlbums(count: number): FullAlbum[];
  findRecentlyAddedAlbums(limit: number): FullAlbum[];
}

type Injects = {
  db: DB;
};

export default function createDiscoverService({
  db,
}: Injects): DiscoverService {
  return {
    findRandomArtists(count) {
      const rows = prepareArtistsQuery<number>(
        db,
        'GROUP BY artists.id ORDER BY RANDOM() LIMIT ?',
      ).all(count);

      return rows.map(toFullArtist);
    },
    findRandomAlbums(count) {
      const rows = prepareAlbumsQuery<number>(
        db,
        'ORDER BY RANDOM() LIMIT ?',
      ).all(count);

      return rows.map(toFullAlbum);
    },
    findRecentlyAddedAlbums(limit) {
      const rows = prepareAlbumsQuery(
        db,
        `ORDER BY albums.createdAt DESC LIMIT ${limit}`,
      ).all();

      return rows.map(toFullAlbum);
    },
  };
}
