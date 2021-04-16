import classNames from 'classnames';
import { PauseIcon, PlayIcon } from 'components/icons';
import If from 'components/If';
import React, { ReactElement } from 'react';
import Icon from '../../icons/Icon/Icon';
import LazyImage from '../LazyImage/LazyImage';
import PlayingIndicator from '../PlayingIndicator/PlayingIndicator';
import styles from './Artwork.module.scss';

type Props = {
  artworkUrl: string;
  fallbackUrl?: string;
  onTogglePlayPause?: () => void;
  isPlaying?: boolean;
  isRounded?: boolean;
  noOverlay?: boolean;
};

function Artwork({
  artworkUrl,
  fallbackUrl,
  onTogglePlayPause,
  isPlaying,
  isRounded,
  noOverlay,
}: Props): ReactElement {
  return (
    <div
      className={classNames(styles.root, {
        [styles.isRounded]: isRounded,
      })}
    >
      <LazyImage
        className={styles.image}
        fallback={fallbackUrl}
        url={artworkUrl}
      />

      <If condition={!noOverlay}>
        <div
          className={classNames(styles.overlay, {
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
      </If>
    </div>
  );
}

export default Artwork;
