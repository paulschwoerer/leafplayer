import { FullArtist } from '@/common';
import { ArtistRow } from '@/database/rows';

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
