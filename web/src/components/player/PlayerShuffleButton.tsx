import { ShuffleIcon } from 'components/icons';
import React, { ReactElement } from 'react';
import MediaControlButton from './MediaControlButton/MediaControlButton';

type Props = {
  shuffle: boolean;
  setShuffle: (shuffle: boolean) => void;
};

function PlayerShuffleButton({ shuffle, setShuffle }: Props): ReactElement {
  return (
    <MediaControlButton
      icon={<ShuffleIcon />}
      active={shuffle}
      onClick={() => setShuffle(!shuffle)}
      small
    />
  );
}

export default PlayerShuffleButton;
