import { FullAlbum, FullArtist } from '@/common';
import { toFullAlbum } from '@/mappers/albums';
import { toFullArtist } from '@/mappers/artists';
import { createAlbumsQuery } from '@/query/albums';
import { createArtistQuery } from '@/query/artists';
import Knex from 'knex';
import { getRandomArrayElements } from '@/helpers/random';

export interface DiscoverService {
  findRandomArtists(count: number): Promise<FullArtist[]>;
  findRandomAlbums(count: number): Promise<FullAlbum[]>;
  findRecentlyAddedAlbums(limit: number): Promise<FullAlbum[]>;
}

type Injects = {
  db: Knex;
};

export function createDiscoverService({ db }: Injects): DiscoverService {
  return {
    async findRandomArtists(count) {
      const randomIds = await findRandomIdsOfTable(db, 'artists', count);

      const rows = await createArtistQuery(db)
        .whereIn('artists.id', randomIds)
        .groupBy('artists.id');

      return rows.map(toFullArtist);
    },
    async findRandomAlbums(count) {
      const randomIds = await findRandomIdsOfTable(db, 'albums', count);

      const rows = await createAlbumsQuery(db).whereIn('albums.id', randomIds);

      return rows.map(toFullAlbum);
    },
    async findRecentlyAddedAlbums(limit) {
      const rows = await createAlbumsQuery(db)
        .orderBy('albums.createdAt', 'desc')
        .limit(limit);

      return rows.map(toFullAlbum);
    },
  };
}

async function findRandomIdsOfTable(
  query: Knex,
  tableName: string,
  count: number,
): Promise<string[]> {
  type Row = { id: string };

  const rows: Row[] = await query(tableName).select('id').where(true);

  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map(row => row.id);

  return getRandomArrayElements<string>(ids, count);
}
