import type { DB, Statement } from '../database/index.ts';
import { type ArtistRow } from '../database/rows.ts';

export function prepareArtistsQuery<TBind = unknown[]>(
  db: DB,
  q: string,
): Statement<TBind, ArtistRow & { artistName: string }> {
  return db.prepare<TBind, ArtistRow & { artistName: string }>(`
    SELECT
      artists.id,
      artists.name,
      artists.createdAt,
      artists.updatedAt,
      COUNT(DISTINCT albums.id) AS albumCount,
      COUNT(DISTINCT songs.id) AS songCount
    FROM artists
    LEFT JOIN albums
      ON albums.artistId = artists.id
    LEFT JOIN songs
      ON songs.artistId = artists.id
    ${q}`);
}
