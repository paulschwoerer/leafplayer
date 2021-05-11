import {
  PauseIcon,
  PlayIcon,
  SkipNextIcon,
  SkipPreviousIcon,
} from 'components/icons';
import MediaControlButton from 'components/player/MediaControlButton/MediaControlButton';
import React, { ReactElement } from 'react';
import styles from './PlayerControls.module.scss';

type Props = {
  canSkipNext: boolean;
  canSkipPrevious: boolean;
  canPlay: boolean;
  isPlaying: boolean;
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
};

function PlayerControls({
  isPlaying,
  togglePlayPause,
  canSkipPrevious,
  canSkipNext,
  skipNext,
  canPlay,
  skipPrevious,
}: Props): ReactElement {
  return (
    <div className={styles.root}>
      <MediaControlButton
        icon={<SkipPreviousIcon />}
        disabled={!canSkipPrevious}
        onClick={skipPrevious}
        small
      />
      <MediaControlButton
        icon={isPlaying ? <PauseIcon /> : <PlayIcon />}
        disabled={!canPlay}
        onClick={togglePlayPause}
      />
      <MediaControlButton
        icon={<SkipNextIcon />}
        disabled={!canSkipNext}
        onClick={skipNext}
        small
      />
    </div>
  );
}

export default PlayerControls;
