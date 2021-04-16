import Slider from 'components/form/Slider/Slider';
import { clamp } from 'helpers/math';
import { durationToString } from 'helpers/time';
import React, { ReactElement } from 'react';
import styles from './PlayerProgress.module.scss';

type Props = {
  totalDuration: number | null;
  elapsedDuration: number;
  bufferedTo: number;
  onSetSeek: (time: number) => void;
};

function PlayerProgress({
  totalDuration,
  elapsedDuration,
  onSetSeek,
  bufferedTo,
}: Props): ReactElement {
  const progress = totalDuration !== null ? elapsedDuration / totalDuration : 0;

  let bufferedWidth = 0;

  if (totalDuration) {
    bufferedWidth = clamp((bufferedTo / totalDuration) * 100, 0, 100);
  }

  return (
    <div className={styles.root}>
      <Slider
        value={progress}
        onDragRelease={value => {
          if (totalDuration) {
            onSetSeek(totalDuration * value);
          }
        }}
        disabled={totalDuration === null}
        before={({ isDragging, dragValue }) => (
          <span className={styles.time}>
            {totalDuration !== null
              ? durationToString(
                  isDragging ? dragValue * totalDuration : elapsedDuration,
                  true,
                )
              : '--:--'}
          </span>
        )}
        after={() => (
          <span className={styles.time}>
            {totalDuration !== null
              ? durationToString(totalDuration, true)
              : '--:--'}
          </span>
        )}
        rangeOverlay={() => {
          return (
            <span
              style={{ width: `${bufferedWidth}%` }}
              className={styles.bufferedOverlay}
            />
          );
        }}
      />
    </div>
  );
}

export default PlayerProgress;
