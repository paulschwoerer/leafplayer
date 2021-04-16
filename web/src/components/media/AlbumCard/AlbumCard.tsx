import { FullAlbum } from 'leafplayer-common';
import React, { PropsWithChildren, ReactElement } from 'react';
import DefaultAlbumImage from 'assets/album-default.jpg';
import RandomImage from 'assets/random.jpg';
import { useArtworkUrl } from 'modules/api';
import { useAlbumPlayState } from 'helpers/albumPlayState';
import AppLink from '../../layout/AppLink/AppLink';
import Artwork from '../Artwork/Artwork';
import InvisibleLink from '../../layout/InvisibleLink/InvisibleLink';
import styles from './AlbumCard.module.scss';

type BaseProps = {
  artworkUrl: string;
  fallbackUrl?: string;
  artworkLink?: string;
  isPlaying?: boolean;
  onTogglePlayPause?: () => void;
};

type FakeAlbumCardProps = {
  label: string;
  onPlay?: () => void;
};

type AlbumCardProps = {
  album: FullAlbum;
};

function BaseAlbumCard({
  artworkUrl,
  fallbackUrl,
  artworkLink,
  isPlaying,
  onTogglePlayPause,
  children,
}: PropsWithChildren<BaseProps>): ReactElement {
  return (
    <div className={styles.root}>
      <InvisibleLink to={artworkLink || '#'}>
        <Artwork
          artworkUrl={artworkUrl}
          fallbackUrl={fallbackUrl}
          onTogglePlayPause={onTogglePlayPause}
          isPlaying={isPlaying}
        />
      </InvisibleLink>
      <div className={styles.info}>{children}</div>
    </div>
  );
}

export function FakeAlbumCard({
  label,
  onPlay,
}: FakeAlbumCardProps): ReactElement {
  return (
    <BaseAlbumCard artworkUrl={RandomImage} onTogglePlayPause={onPlay}>
      <span className={styles.name}>{label}</span>
    </BaseAlbumCard>
  );
}

export function AlbumCard({ album }: AlbumCardProps): ReactElement {
  const [isPlaying, togglePlayPause] = useAlbumPlayState(album.id);
  const artworkUrl = useArtworkUrl({ type: 'album', id: album.id, size: 256 });

  const albumLink = `/album/${album.id}`;
  const artistLink = `/artist/${album.artist.id}`;

  return (
    <BaseAlbumCard
      artworkUrl={artworkUrl}
      artworkLink={albumLink}
      fallbackUrl={DefaultAlbumImage}
      onTogglePlayPause={togglePlayPause}
      isPlaying={isPlaying}
    >
      <AppLink to={albumLink} title={album.name} className={styles.name}>
        {album.name}
      </AppLink>
      <AppLink
        to={artistLink}
        title={album.artist.name}
        className={styles.artist}
      >
        {album.artist.name}
      </AppLink>
    </BaseAlbumCard>
  );
}
