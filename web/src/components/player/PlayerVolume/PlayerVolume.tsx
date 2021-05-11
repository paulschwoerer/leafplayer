import Icon from 'components/icons/Icon/Icon';
import Slider from 'components/form/Slider/Slider';
import React, { ReactElement, useState } from 'react';
import styles from './PlayerVolume.module.scss';
import { VolumeDownIcon, VolumeOffIcon, VolumeUpIcon } from 'components/icons';

type Props = {
  volume: number;
  isMuted: boolean;
  onSetVolume: (volume: number) => void;
  onToggleMute: () => void;
};

function PlayerVolume({
  volume,
  onSetVolume,
  isMuted,
  onToggleMute,
}: Props): ReactElement {
  const displayVolume = isMuted ? 0 : volume;
  const [isAdjusting, setIsAdjusting] = useState(false);

  return (
    <div className={styles.root}>
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
