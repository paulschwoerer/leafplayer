import DefaultAlbumImage from 'assets/album-default.jpg';
import LazyImage from 'components/media/LazyImage/LazyImage';
import { useArtworkUrl } from 'modules/api';
import { QueueItem } from 'modules/player/types';
import React, { ReactElement } from 'react';
import styles from './QueueCurrent.module.scss';

type Props = {
  current: QueueItem;
};

function QueueCurrent({
  current: {
    song: { album, artist, ...song },
  },
}: Props): ReactElement {
  const artworkUrl = useArtworkUrl({ type: 'album', id: album.id, size: 256 });

  return (
    <div className={styles.root}>
      <div
        className={styles.background}
        style={{ backgroundImage: `url(${artworkUrl})` }}
      />
      <div className={styles.content}>
        <div className={styles.label}>Current Song</div>
        <div className={styles.info}>
          <div className={styles.artwork}>
            <LazyImage url={artworkUrl} fallback={DefaultAlbumImage} />
          </div>
          <div>
            <p title={song.title} className={styles.title}>
              {song.title}
            </p>
            <span className={styles.artist} title={artist.name}>
              {artist.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueueCurrent;
