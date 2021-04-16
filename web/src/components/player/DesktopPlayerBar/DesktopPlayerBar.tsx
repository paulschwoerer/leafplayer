import classNames from 'classnames';
import React, { ReactElement, useContext } from 'react';
import { PlayerContext } from 'modules/player/context';
import styles from './DesktopPlayerBar.module.scss';
import PlayerControls from '../PlayerControls/PlayerControls';
import PlayerCurrent from '../PlayerCurrent/PlayerCurrent';
import PlayerProgress from '../PlayerProgress/PlayerProgress';
import Icon from 'components/icons/Icon/Icon';
import InvisibleLink from 'components/layout/InvisibleLink/InvisibleLink';
import PlayerVolume from '../PlayerVolume/PlayerVolume';
import { QueueIcon } from 'components/icons';

type Props = {
  className: string;
};

function DesktopPlayerBar({ className }: Props): ReactElement {
  const [
    {
      isPlaying,
      current,
      seek,
      volume,
      isMuted,
      canSkipNext,
      canSkipPrevious,
      repeatMode,
      shuffle,
      bufferedTo,
    },
    {
      setSeek,
      setVolume,
      toggleMute,
      skipNext,
      skipPrevious,
      togglePlayPause,
      setRepeatMode,
      setShuffle,
    },
  ] = useContext(PlayerContext);

  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.layout}>
        <div className={styles.controls}>
          <PlayerControls
            isPlaying={isPlaying}
            canPlay={!!current}
            canSkipNext={canSkipNext}
            canSkipPrevious={canSkipPrevious}
            repeatMode={repeatMode}
            setRepeatMode={setRepeatMode}
            skipNext={skipNext}
            skipPrevious={skipPrevious}
            togglePlayPause={togglePlayPause}
            shuffle={shuffle}
            setShuffle={setShuffle}
          />
        </div>
        <div className={styles.volume}>
          <PlayerVolume
            volume={volume}
            isMuted={isMuted}
            onSetVolume={setVolume}
            onToggleMute={toggleMute}
          />
        </div>
        <div className={styles.progress}>
          <PlayerProgress
            totalDuration={current?.song.duration || null}
            elapsedDuration={seek}
            onSetSeek={setSeek}
            bufferedTo={bufferedTo}
          />
        </div>
        <div className={styles.current}>
          <PlayerCurrent current={current} />
        </div>
        <InvisibleLink to="/queue" className={styles.queueButton}>
          <Icon icon={<QueueIcon />} />
        </InvisibleLink>
      </div>
    </div>
  );
}

export default DesktopPlayerBar;