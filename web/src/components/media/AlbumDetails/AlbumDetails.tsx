import { durationToString } from 'helpers/time';
import { FullAlbum, FullSong } from 'leafplayer-common';
import React, { ReactElement } from 'react';
import { SongCount } from '../Counts';
import styles from './AlbumDetails.module.scss';

type Props = {
  album: FullAlbum;
  songs: FullSong[];
  artistName?: ReactElement | string | null;
};

function AlbumDetails({ album: { name, year }, songs, artistName }: Props) {
  const totalDuration = songs
    .map(song => song.duration)
    .reduce((accumulator, currentValue) => accumulator + currentValue);

  return (
    <div className={styles.root}>
      <h2 title={name}>{name}</h2>
      {artistName && <p>{artistName}</p>}
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
