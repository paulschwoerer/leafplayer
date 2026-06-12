import { FullAlbum, FullArtist } from '@/common';
import { toFullAlbum } from '@/mappers/albums';
import { toFullArtist } from '@/mappers/artists';
import { prepareAlbumsQuery } from '@/query/albums';
import { prepareArtistsQuery } from '@/query/artists';
import { getRandomArrayElements } from '@/helpers/random';
import { DB } from '@/database';

export interface DiscoverService {
  findRandomArtists(count: number): FullArtist[];
  findRandomAlbums(count: number): FullAlbum[];
  findRecentlyAddedAlbums(limit: number): FullAlbum[];
}

type Injects = {
  db: DB;
};

// TODO: this could probably done more concise by using random offsets and limits
export default function createDiscoverService({
  db,
}: Injects): DiscoverService {
  return {
    findRandomArtists(count) {
      const randomIds = findRandomIdsOfTable(db, 'artists', count);

      const rows = prepareArtistsQuery<string[]>(
        db,
        `WHERE artists.id IN (${randomIds
          .map(() => '?')
          .join(',')}) GROUP BY artists.id`,
      ).all(...randomIds);

      return rows.map(toFullArtist);
    },
    findRandomAlbums(count) {
      const randomIds = findRandomIdsOfTable(db, 'albums', count);

      const rows = prepareAlbumsQuery<string[]>(
        db,
        `WHERE albums.id IN (${randomIds.map(() => '?').join(',')})`,
      ).all(...randomIds);

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

function findRandomIdsOfTable(
  db: DB,
  tableName: string,
  count: number,
): string[] {
  type Row = { id: string };

  const rows: Row[] = db
    .prepare<unknown[], { id: string }>(`SELECT id FROM ${tableName}`)
    .all();

  if (rows.length === 0) {
    return [];
  }

  const ids = rows.map(row => row.id);

  return getRandomArrayElements<string>(ids, count);
}
