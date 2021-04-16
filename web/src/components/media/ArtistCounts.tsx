import { FullArtist } from 'leafplayer-common';
import React, { ReactElement } from 'react';
import { AlbumCount, SongCount } from './Counts';

type Props = {
  artist: FullArtist;
  className?: string;
};

function ArtistCounts({
  artist: { albumCount, songCount },
  className,
}: Props): ReactElement {
  if (albumCount === 0) {
    return <span className={className}>{SongCount({ count: songCount })}</span>;
  }

  if (songCount === 0) {
    return (
      <span className={className}>{AlbumCount({ count: albumCount })}</span>
    );
  }

  return (
    <span className={className}>
      {AlbumCount({ count: albumCount })} • {SongCount({ count: songCount })}
    </span>
  );
}

export default ArtistCounts;
