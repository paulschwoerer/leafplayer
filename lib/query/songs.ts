import type { DB, Statement } from '../database/index.ts';
import { type SongRow } from '../database/rows.ts';

type SongRowWithNames = SongRow & { artistName: string; albumName: string };

export function prepareSongsQuery<
  TBind extends unknown[] | unknown = unknown[],
>(db: DB, q: string): Statement<TBind, SongRowWithNames> {
  return db.prepare<TBind, SongRowWithNames>(`
    SELECT
      songs.*,
      albums.name as albumName,
      artists.name as artistName
    FROM songs
    INNER JOIN albums
      ON songs.albumId = albums.id
    INNER JOIN artists
      ON songs.artistId = artists.id
    ${q}`);
}
