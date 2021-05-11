import classNames from 'classnames';
import { ButtonText } from 'components/form/Button/Button';
import { QueueIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import IconButton from 'components/icons/IconButton/IconButton';
import InvisibleLink from 'components/layout/InvisibleLink/InvisibleLink';
import Duration from 'components/media/Duration/Duration';
import { useMediaQuery } from 'helpers/mediaQuery';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext, useState } from 'react';
import PlayerControls from '../PlayerControls/PlayerControls';
import PlayerCurrent from '../PlayerCurrent/PlayerCurrent';
import PlayerProgressBar from '../PlayerProgressBar/PlayerProgressBar';
import PlayerRepeatButton from '../PlayerRepeatButton';
import PlayerShuffleButton from '../PlayerShuffleButton';
import PlayerVolume from '../PlayerVolume/PlayerVolume';
import styles from './DesktopPlayerBar.module.scss';

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

  const [isSeeking, setIsSeeking] = useState(false);
  const [userSeek, setUserSeek] = useState(0);
  const useSmallQueueButton = useMediaQuery('(max-width: 950px)');

  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.layout}>
        <div className={styles.mainControls}>
          <PlayerControls
            isPlaying={isPlaying}
            canPlay={!!current}
            canSkipNext={canSkipNext}
            canSkipPrevious={canSkipPrevious}
            skipNext={skipNext}
            skipPrevious={skipPrevious}
            togglePlayPause={togglePlayPause}
          />
          <div className={styles.durations}>
            <Duration seconds={isSeeking ? userSeek : current ? seek : null} />
            <span className={styles.slash}>/</span>
            <Duration seconds={current ? current.song.duration : null} />
          </div>
        </div>
        <div className={styles.sideControls}>
          <PlayerRepeatButton
            repeatMode={repeatMode}
            setRepeatMode={setRepeatMode}
          />
          <PlayerShuffleButton shuffle={shuffle} setShuffle={setShuffle} />
          <PlayerVolume
            volume={volume}
            isMuted={isMuted}
            onSetVolume={setVolume}
            onToggleMute={toggleMute}
          />
        </div>
        <div className={styles.progress}>
          <PlayerProgressBar
            totalDuration={current?.song.duration || 0}
            elapsedDuration={seek}
            bufferedTo={bufferedTo}
            isSeeking={isSeeking}
            userSeek={userSeek}
            onSeekStart={value => {
              setIsSeeking(true);
              setUserSeek(value);
            }}
            onSeekUpdate={setUserSeek}
            onSeekRelease={value => {
              setIsSeeking(false);
              setSeek(value);
            }}
          />
        </div>
        <div className={styles.current}>
          <PlayerCurrent current={current} />
        </div>
        <InvisibleLink to="/queue" className={styles.queueButton}>
          {useSmallQueueButton ? (
            <IconButton icon={<QueueIcon />} />
          ) : (
            <ButtonText>
              Queue
              <Icon icon={<QueueIcon />} />
            </ButtonText>
          )}
        </InvisibleLink>
      </div>
    </div>
  );
}

export default DesktopPlayerBar;
