import classnames from 'classnames';
import DefaultAlbumImage from 'assets/album-default.jpg';
import If from 'components/If';
import AppLink from 'components/layout/AppLink/AppLink';
import { useMediaQuery } from 'helpers/mediaQuery';
import { durationToString } from 'helpers/time';
import { FullSong } from 'leafplayer-common';
import { useArtworkUrl } from 'modules/api';
import React, { ReactElement } from 'react';
import LazyImage from '../LazyImage/LazyImage';
import styles from './SongRow.module.scss';
import PlayingIndicator from '../PlayingIndicator/PlayingIndicator';
import Icon from 'components/icons/Icon/Icon';
import { PauseIcon, PlayIcon } from 'components/icons';

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
      <div className={styles.post}>
        <span className={styles.duration}>
          {durationToString(song.duration)}
        </span>
        <div className={styles.options}>{options}</div>
      </div>
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

  const artworkUrl = useArtworkUrl({
    type: 'album',
    id: album.id,
    size: 96,
  });

  return (
    <Base
      {...props}
      pre={
        <div className={styles.artwork}>
          <LazyImage url={artworkUrl} fallback={DefaultAlbumImage} />
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
        <Icon icon={isCurrentlyPlaying ? <PauseIcon /> : <PlayIcon />} />
      </div>
      <div className={styles.notHoverContent}>
        {isCurrentlyPlaying ? <PlayingIndicator /> : <span>{song.track}</span>}
      </div>
    </div>
  );
}
