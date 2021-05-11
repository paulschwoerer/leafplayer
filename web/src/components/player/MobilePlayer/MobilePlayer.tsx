import DefaultAlbumImage from 'assets/album-default.jpg';
import { ExpandMoreIcon, QueueIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import AspectRatioOneToOne from 'components/layout/AspectRatioOneToOne/AspectRatioOneToOne';
import InvisibleLink from 'components/layout/InvisibleLink/InvisibleLink';
import Duration from 'components/media/Duration/Duration';
import LazyImage from 'components/media/LazyImage/LazyImage';
import { useArtworkUrl } from 'modules/api';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext, useState } from 'react';
import PlayerControls from '../PlayerControls/PlayerControls';
import PlayerProgressBar from '../PlayerProgressBar/PlayerProgressBar';
import PlayerRepeatButton from '../PlayerRepeatButton';
import PlayerShuffleButton from '../PlayerShuffleButton';
import styles from './MobilePlayer.module.scss';

type Props = {
  onClose?: () => void;
};

function MobilePlayer({ onClose }: Props): ReactElement {
  const [
    {
      current,
      bufferedTo,
      seek,
      canSkipPrevious,
      canSkipNext,
      isPlaying,
      repeatMode,
      shuffle,
    },
    {
      setSeek,
      skipNext,
      skipPrevious,
      togglePlayPause,
      setRepeatMode,
      setShuffle,
    },
  ] = useContext(PlayerContext);
  const artworkUrl = useArtworkUrl({
    type: 'album',
    id: current ? current.song.album.id : '',
    size: 512,
  });

  const [isSeeking, setIsSeeking] = useState(false);
  const [userSeek, setUserSeek] = useState(0);

  return (
    <div className={styles.root}>
      <header>
        <IconButton icon={<ExpandMoreIcon />} onClick={onClose} />
        <InvisibleLink to={`/queue`}>
          <IconButton icon={<QueueIcon />} onClick={onClose} />
        </InvisibleLink>
      </header>
      <section className={styles.artworkWrapper}>
        <div className={styles.artwork}>
          <AspectRatioOneToOne>
            <LazyImage url={artworkUrl} fallback={DefaultAlbumImage} />
          </AspectRatioOneToOne>
        </div>
      </section>
      <section className={styles.info}>
        <p className={styles.title}>{current?.song.title}</p>
        <p className={styles.artist}>{current?.song.artist.name}</p>
      </section>
      <section className={styles.progress}>
        <div className={styles.durations}>
          <Duration seconds={isSeeking ? userSeek : current ? seek : null} />
          <Duration seconds={current ? current.song.duration : null} />
        </div>
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
      </section>
      <section className={styles.mainControls}>
        <PlayerShuffleButton shuffle={shuffle} setShuffle={setShuffle} />
        <PlayerControls
          isPlaying={isPlaying}
          canPlay={!!current}
          canSkipNext={canSkipNext}
          canSkipPrevious={canSkipPrevious}
          skipNext={skipNext}
          skipPrevious={skipPrevious}
          togglePlayPause={togglePlayPause}
        />
        <PlayerRepeatButton
          repeatMode={repeatMode}
          setRepeatMode={setRepeatMode}
        />
      </section>
    </div>
  );
}

export default MobilePlayer;
