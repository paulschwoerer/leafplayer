import Slider from 'components/form/Slider/Slider';
import { VolumeDownIcon, VolumeOffIcon, VolumeUpIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import { clamp } from 'helpers/math';
import React, { ReactElement, useState } from 'react';
import styles from './PlayerVolume.module.scss';

type Props = {
  volume: number;
  isMuted: boolean;
  onSetVolume: (volume: number) => void;
  onToggleMute: () => void;
};

const MOUSE_WHEEL_STEP = 1 / 12;

function PlayerVolume({
  volume,
  onSetVolume,
  isMuted,
  onToggleMute,
}: Props): ReactElement {
  const displayVolume = isMuted ? 0 : volume;
  const [isAdjusting, setIsAdjusting] = useState(false);

  function onWheel(ev: React.WheelEvent) {
    ev.stopPropagation();
    ev.preventDefault();

    const direction = Math.sign(ev.deltaY) * -1;
    const newVolume = clamp(volume + direction * MOUSE_WHEEL_STEP, 0, 1);

    if (newVolume !== volume) {
      onSetVolume(newVolume);
    }
  }

  return (
    <div className={styles.root} onWheel={onWheel}>
      {renderVolumeIcon({ volume, isMuted, onClick: onToggleMute })}
      <Slider
        value={displayVolume}
        isDragging={isAdjusting}
        onDragStart={value => {
          setIsAdjusting(true);
          onSetVolume(value);
        }}
        onDragUpdate={onSetVolume}
        onDragRelease={value => {
          setIsAdjusting(false);
          onSetVolume(value);
        }}
      />
    </div>
  );
}

function renderVolumeIcon({
  volume,
  isMuted,
  onClick,
}: {
  volume: number;
  isMuted: boolean;
  onClick: () => void;
}) {
  if (volume === 0 || isMuted) {
    return (
      <Icon
        icon={<VolumeOffIcon />}
        className={styles.icon}
        onClick={onClick}
      />
    );
  }

  if (volume <= 0.5) {
    return (
      <Icon
        icon={<VolumeDownIcon />}
        className={styles.icon}
        onClick={onClick}
      />
    );
  }

  return (
    <Icon icon={<VolumeUpIcon />} className={styles.icon} onClick={onClick} />
  );
}

export default PlayerVolume;
