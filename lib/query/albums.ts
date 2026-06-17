import { AlbumRow } from '../database/rows.ts';
import { DB, Statement } from '../database/index.ts';

export function prepareAlbumsQuery<
  TBind extends unknown[] | unknown = unknown[],
>(db: DB, q: string): Statement<TBind, AlbumRow & { artistName: string }> {
  return db.prepare<TBind, AlbumRow & { artistName: string }>(`
    SELECT
      albums.id,
      albums.name,
      albums.year,
      albums.createdAt,
      albums.updatedAt,
      artists.id as artistId,
      artists.name as artistName
    FROM albums
    INNER JOIN artists
      ON albums.artistId = artists.id
    ${q}`);
}
