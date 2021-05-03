import DefaultAlbumImage from 'assets/album-default.jpg';
import { ExpandMoreIcon, QueueIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import AspectRatioOneToOne from 'components/layout/AspectRatioOneToOne/AspectRatioOneToOne';
import InvisibleLink from 'components/layout/InvisibleLink/InvisibleLink';
import LazyImage from 'components/media/LazyImage/LazyImage';
import { useArtworkUrl } from 'modules/api';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';
import PlayerControls from '../PlayerControls/PlayerControls';
import PlayerProgress from '../PlayerProgress/PlayerProgress';
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

  return (
    <div className={styles.root}>
      <header>
        <IconButton icon={<ExpandMoreIcon />} onClick={onClose} />
        <InvisibleLink to={`/queue`}>
          <IconButton icon={<QueueIcon />} onClick={onClose} />
        </InvisibleLink>
      </header>
      <section className={styles.artwork}>
        <AspectRatioOneToOne>
          <LazyImage url={artworkUrl} fallback={DefaultAlbumImage} />
        </AspectRatioOneToOne>
      </section>
      <section className={styles.info}>
        <p className={styles.title}>{current?.song.title}</p>
        <p className={styles.artist}>{current?.song.artist.name}</p>
      </section>
      <section className={styles.progress}>
        <PlayerProgress
          bufferedTo={bufferedTo}
          elapsedDuration={seek}
          onSetSeek={setSeek}
          totalDuration={current?.song.duration || null}
        />
      </section>
      <section className={styles.mainControls}>
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
      </section>
    </div>
  );
}

export default MobilePlayer;
