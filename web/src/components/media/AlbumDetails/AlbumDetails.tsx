import AppLink from 'components/layout/AppLink/AppLink';
import { durationToString } from 'helpers/time';
import { FullAlbum, FullSong } from 'leafplayer-common';
import React from 'react';
import { SongCount } from '../Counts';
import styles from './AlbumDetails.module.scss';

type Props = {
  album: FullAlbum;
  songs: FullSong[];
  hideArtist?: boolean;
};

function AlbumDetails({
  album: { name, artist, year },
  songs,
  hideArtist,
}: Props) {
  const totalDuration = songs
    .map(song => song.duration)
    .reduce((accumulator, currentValue) => accumulator + currentValue);

  return (
    <div className={styles.root}>
      <h2 title={name}>{name}</h2>
      {!hideArtist && (
        <p>
          <AppLink to={`/artist/${artist.id}`} title={artist.name}>
            {artist.name}
          </AppLink>
        </p>
      )}
      <p className={styles.misc}>
        <span>{year || 'Unknown year'}</span>
        <span>
          <SongCount count={songs.length} />
        </span>
        <span>{durationToString(totalDuration, false, false)}</span>
      </p>
    </div>
  );
}

export default AlbumDetails;
