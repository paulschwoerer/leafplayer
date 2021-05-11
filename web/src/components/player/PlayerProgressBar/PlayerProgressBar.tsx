import Slider from 'components/form/Slider/Slider';
import { clamp } from 'helpers/math';
import React, { ReactElement } from 'react';
import styles from './PlayerProgressBar.module.scss';

type Props = {
  isSeeking: boolean;
  userSeek: number;
  totalDuration: number;
  elapsedDuration: number;
  bufferedTo: number;
  onSeekStart: (seconds: number) => void;
  onSeekUpdate: (seconds: number) => void;
  onSeekRelease: (seconds: number) => void;
};

function PlayerProgressBar({
  isSeeking,
  userSeek,
  totalDuration,
  elapsedDuration,
  bufferedTo,
  onSeekStart,
  onSeekUpdate,
  onSeekRelease,
}: Props): ReactElement {
  function calculateProgress() {
    if (totalDuration === 0) {
      return 0;
    }

    if (isSeeking) {
      return userSeek / totalDuration;
    }

    return elapsedDuration / totalDuration;
  }

  function calculateBufferedWidth() {
    if (totalDuration === 0) {
      return 0;
    }

    return clamp((bufferedTo / totalDuration) * 100, 0, 100);
  }

  const progress = calculateProgress();
  const bufferedWidth = calculateBufferedWidth();

  return (
    <div className={styles.root}>
      <Slider
        isDragging={isSeeking}
        value={progress}
        onDragStart={value => onSeekStart(totalDuration * value)}
        onDragUpdate={value => onSeekUpdate(totalDuration * value)}
        onDragRelease={value => onSeekRelease(totalDuration * value)}
      >
        <span
          style={{ width: `${bufferedWidth}%` }}
          className={styles.bufferedOverlay}
        />
      </Slider>
    </div>
  );
}

export default PlayerProgressBar;
