import { FullSong } from '@/common';
import { SongRow } from '@/database/rows';

type Row = Omit<SongRow, 'fileId'> & {
  artistName: string;
  albumName: string;
};

export function toFullSong({
  artistName,
  albumName,
  artistId,
  albumId,
  track,
  ...rest
}: Row): FullSong {
  return {
    ...rest,
    track: track || undefined,
    album: {
      id: albumId,
      name: albumName,
    },
    artist: {
      id: artistId,
      name: artistName,
    },
  };
}
