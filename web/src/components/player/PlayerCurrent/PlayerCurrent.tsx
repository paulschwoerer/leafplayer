import DefaultAlbumImage from 'assets/album-default.jpg';
import AppLink from 'components/layout/AppLink/AppLink';
import InvisibleLink from 'components/layout/InvisibleLink/InvisibleLink';
import TextPlaceholder from 'components/layout/TextPlaceholder/TextPlaceholder';
import { useArtworkUrl } from 'modules/api';
import { QueueItem } from 'modules/player/types';
import React, { ReactElement } from 'react';
import styles from './PlayerCurrent.module.scss';

type Props = {
  current: QueueItem | null;
};

function PlayerCurrent({ current }: Props): ReactElement {
  const artworkUrl = useArtworkUrl({
    type: 'album',
    id: current ? current.song.album.id : 'invalid',
    size: 96,
  });

  if (!current) {
    return (
      <div className={styles.root}>
        <div className={styles.artwork}>
          <img src={DefaultAlbumImage} />
        </div>
        <div className={styles.info}>
          <TextPlaceholder thickness={12} length={160} />
          <TextPlaceholder thickness={8} length={120} />
        </div>
      </div>
    );
  }

  const {
    song: { artist, album, ...song },
  } = current;

  return (
    <div className={styles.root}>
      <InvisibleLink className={styles.artwork} to={`/album/${album.id}`}>
        <img src={artworkUrl} />
      </InvisibleLink>
      <div className={styles.info}>
        <span className={styles.title} title={song.title}>
          {song.title}
        </span>
        <AppLink
          to={`/artist/${artist.id}`}
          title={artist.name}
          className={styles.artist}
        >
          {artist.name}
        </AppLink>
      </div>
    </div>
  );
}

export default PlayerCurrent;
