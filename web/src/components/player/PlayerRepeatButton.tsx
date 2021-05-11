import { RepeatIcon, RepeatOneIcon } from 'components/icons';
import MediaControlButton from 'components/player/MediaControlButton/MediaControlButton';
import { PlayerRepeatMode } from 'modules/player/types';
import React, { ReactElement } from 'react';

type Props = {
  repeatMode: PlayerRepeatMode;
  setRepeatMode: (mode: PlayerRepeatMode) => void;
};

function PlayerRepeatButton({
  repeatMode,
  setRepeatMode,
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
    <MediaControlButton
      icon={getRepeatIcon(repeatMode)}
      active={repeatMode !== PlayerRepeatMode.DISABLED}
      onClick={cycleRepeatMode}
      small
    />
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

export default PlayerRepeatButton;
