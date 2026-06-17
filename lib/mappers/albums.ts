import { type FullAlbum } from 'leafplayer-common';

import { type AlbumRow } from '../database/rows.ts';

export function toFullAlbum({
  artistId,
  artistName,
  year,
  ...rest
}: AlbumRow & {
  artistName: string;
}): FullAlbum {
  return {
    ...rest,
    artist: {
      id: artistId,
      name: artistName,
    },
    year: year || undefined,
  };
}
