import { type FullArtist } from 'leafplayer-common';

import { type ArtistRow } from '../database/rows.ts';

export function toFullArtist(
  row: ArtistRow & {
    albumCount?: number;
    songCount?: number;
  },
): FullArtist {
  return {
    ...row,
    albumCount: row.albumCount || 0,
    songCount: row.songCount || 0,
  };
}
