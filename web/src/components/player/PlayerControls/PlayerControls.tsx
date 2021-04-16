import {
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
  SkipNextIcon,
  SkipPreviousIcon,
} from 'components/icons';
import MediaControlButton from 'components/player/MediaControlButton/MediaControlButton';
import { PlayerRepeatMode } from 'modules/player/types';
import React, { ReactElement } from 'react';
import styles from './PlayerControls.module.scss';

type Props = {
  canSkipNext: boolean;
  canSkipPrevious: boolean;
  canPlay: boolean;
  isPlaying: boolean;
  repeatMode: PlayerRepeatMode;
  shuffle: boolean;
  setRepeatMode: (mode: PlayerRepeatMode) => void;
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  setShuffle: (shuffle: boolean) => void;
};

function PlayerControls({
  isPlaying,
  togglePlayPause,
  canSkipPrevious,
  canSkipNext,
  skipNext,
  canPlay,
  repeatMode,
  setRepeatMode,
  skipPrevious,
  shuffle,
  setShuffle,
}: Props): ReactElement {
  function cycleRepeatMode() {
    let newMode = PlayerRepeatMode.DISABLED;
    newMode =
      repeatMode === PlayerRepeatMode.ALL ? PlayerRepeatMode.ONE : newMode;
    newMode =
      repeatMode === PlayerRepeatMode.DISABLED ? PlayerRepeatMode.ALL : newMode;

    setRepeatMode(newMode);
  }

  return (
    <div className={styles.root}>
      <div className={styles.buttons}>
        <MediaControlButton
          icon={<ShuffleIcon />}
          active={shuffle}
          onClick={() => setShuffle(!shuffle)}
          small
        />
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
        <MediaControlButton
          icon={getRepeatIcon(repeatMode)}
          active={repeatMode !== PlayerRepeatMode.DISABLED}
          onClick={cycleRepeatMode}
          small
        />
      </div>
    </div>
  );
}

function getRepeatIcon(mode: PlayerRepeatMode): ReactElement {
  switch (mode) {
    case PlayerRepeatMode.ALL:
    case PlayerRepeatMode.DISABLED:
      return <RepeatIcon />;
    case PlayerRepeatMode.ONE:
      return <RepeatOneIcon />;
  }
}

export default PlayerControls;
