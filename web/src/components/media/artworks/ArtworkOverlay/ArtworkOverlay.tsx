import classNames from 'classnames';
import { PauseIcon, PlayIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import PlayingIndicator from 'components/media/PlayingIndicator/PlayingIndicator';
import React, { ReactElement } from 'react';
import styles from './ArtworkOverlay.module.scss';

type Props = {
  isPlaying?: boolean;
  onTogglePlayPause?: () => void;
};

function ArtworkOverlay({ isPlaying, onTogglePlayPause }: Props): ReactElement {
  return (
    <div
      className={classNames(styles.root, {
        [styles.isPlaying]: isPlaying,
      })}
    >
      <div
        className={styles.playPause}
        onClick={ev => {
          ev.preventDefault();
          ev.stopPropagation();
          onTogglePlayPause && onTogglePlayPause();
        }}
      >
        <Icon icon={isPlaying ? <PauseIcon /> : <PlayIcon />} size="lg" />
      </div>
      {isPlaying && (
        <PlayingIndicator size="md" className={styles.playingIndicator} />
      )}
    </div>
  );
}

export default ArtworkOverlay;
