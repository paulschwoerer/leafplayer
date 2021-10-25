import classnames from 'classnames';
import { PauseIcon, PlayIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import If from 'components/If';
import AppLink from 'components/layout/AppLink/AppLink';
import { useMediaQuery } from 'helpers/mediaQuery';
import { durationToString } from 'helpers/time';
import { FullSong } from 'leafplayer-common';
import React, { ReactElement } from 'react';
import ThemedAlbumArtwork from '../artworks/ThemedAlbumArtwork';
import PlayingIndicator from '../PlayingIndicator/PlayingIndicator';
import styles from './SongRow.module.scss';

type Props = {
  song: FullSong;
  isCurrentlyPlaying?: boolean;
  hideArtist?: boolean;
  options: ReactElement;
  onPlay?: () => void;
};

function Base({
  song,
  hideArtist,
  isCurrentlyPlaying,
  onPlay,
  pre,
  options,
}: Props & { pre?: ReactElement }): ReactElement {
  const isMobile = useMediaQuery('(max-width: 700px)');

  function onPlayMobile() {
    if (isMobile && onPlay) {
      onPlay();
    }
  }

  return (
    <div
      className={classnames(styles.root, {
        [styles.isPlaying]: isCurrentlyPlaying,
      })}
    >
      {pre && (
        <div className={styles.pre} onClick={onPlayMobile}>
          {pre}
        </div>
      )}
      <div className={styles.main} onClick={onPlayMobile}>
        <p className={styles.title}>{song.title}</p>
        <If condition={!hideArtist}>
          {isMobile ? (
            <p className={styles.artist}>{song.artist.name}</p>
          ) : (
            <AppLink to={`/artist/${song.artist.id}`} className={styles.artist}>
              {song.artist.name}
            </AppLink>
          )}
        </If>
      </div>
      <div className={styles.duration}>
        <span>{durationToString(song.duration)}</span>
      </div>
      <div className={styles.options}>{options}</div>
    </div>
  );
}

export function SongRow(props: Props): ReactElement {
  return <Base {...props} pre={renderPlayControl(props)} />;
}

export function SongRowWithArtwork(props: Props): ReactElement {
  const {
    song: { album },
  } = props;

  return (
    <Base
      {...props}
      pre={
        <div className={styles.artwork}>
          <ThemedAlbumArtwork id={album.id} size={96} />
          <div className={styles.overlay}>{renderPlayControl(props)}</div>
        </div>
      }
    />
  );
}

function renderPlayControl({
  isCurrentlyPlaying,
  song,
  onPlay,
}: Props): ReactElement {
  return (
    <div className={styles.playControl}>
      <div className={styles.hoverContent} onClick={onPlay}>
        <IconButton icon={isCurrentlyPlaying ? <PauseIcon /> : <PlayIcon />} />
      </div>
      <div className={styles.notHoverContent}>
        {isCurrentlyPlaying ? <PlayingIndicator /> : <span>{song.track}</span>}
      </div>
    </div>
  );
}
