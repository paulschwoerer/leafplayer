import { FullAlbum } from '@/common';
import { AlbumRow } from '@/database/rows';

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
