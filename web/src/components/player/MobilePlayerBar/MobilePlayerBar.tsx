import classNames from 'classnames';
import RoundButton from 'components/form/RoundButton/RoundButton';
import { PauseIcon, PlayIcon } from 'components/icons';
import ThemedAlbumArtwork from 'components/media/artworks/ThemedAlbumArtwork';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';
import styles from './MobilePlayerBar.module.scss';

type Props = {
  className?: string;
  onClick?: (ev: React.MouseEvent) => void;
};

function MobilePlayerBar({ className, onClick }: Props): ReactElement | null {
  const [{ current, isPlaying }, { togglePlayPause }] = useContext(
    PlayerContext,
  );

  if (!current) {
    return null;
  }

  const {
    song: { title, artist },
  } = current;

  return (
    <div className={classNames(styles.root, className)}>
      <ThemedAlbumArtwork id={current.song.album.id} size={96} />
      <div className={styles.details} onClick={onClick}>
        <span className={styles.title} title={title}>
          {title}
        </span>
        <span className={styles.artist}>{artist.name}</span>
      </div>

      <RoundButton
        icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
        onClick={togglePlayPause}
        className={styles.playButton}
      />
    </div>
  );
}

export default MobilePlayerBar;
