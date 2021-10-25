import AlbumDefaultDay from 'assets/artworks/album-default-day.jpg';
import AlbumDefaultNight from 'assets/artworks/album-default-night.jpg';
import AppLink from 'components/layout/AppLink/AppLink';
import InvisibleLink from 'components/layout/InvisibleLink/InvisibleLink';
import TextPlaceholder from 'components/layout/TextPlaceholder/TextPlaceholder';
import ThemedAlbumArtwork from 'components/media/artworks/ThemedAlbumArtwork';
import { useThemedUrl } from 'modules/artworks';
import { QueueItem } from 'modules/player/types';
import React, { ReactElement } from 'react';
import styles from './PlayerCurrent.module.scss';

type Props = {
  current: QueueItem | null;
};

function PlayerCurrent({ current }: Props): ReactElement {
  const fallbackUrl = useThemedUrl(AlbumDefaultDay, AlbumDefaultNight);

  if (!current) {
    return (
      <div className={styles.root}>
        <div className={styles.artwork}>
          <img src={fallbackUrl} />
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
        <ThemedAlbumArtwork id={album.id} size={96} />
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
