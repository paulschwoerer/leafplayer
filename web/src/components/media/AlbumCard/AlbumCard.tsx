import { useAlbumPlayState } from 'helpers/albumPlayState';
import { FullAlbum } from 'leafplayer-common';
import React, { PropsWithChildren, ReactElement } from 'react';
import AppLink from '../../layout/AppLink/AppLink';
import InvisibleLink from '../../layout/InvisibleLink/InvisibleLink';
import Artwork from '../artworks/Artwork/Artwork';
import ArtworkOverlay from '../artworks/ArtworkOverlay/ArtworkOverlay';
import ThemedAlbumArtwork from '../artworks/ThemedAlbumArtwork';
import ThemedSurpriseArtwork from '../artworks/ThemedSurpriseArtwork';
import styles from './AlbumCard.module.scss';

type BaseProps = {
  artwork: ReactElement;
  link?: string;
};

type FakeAlbumCardProps = {
  label: string;
  onPlay?: () => void;
};

type AlbumCardProps = {
  album: FullAlbum;
};

function BaseAlbumCard({
  artwork,
  link,
  children,
}: PropsWithChildren<BaseProps>): ReactElement {
  return (
    <div className={styles.root}>
      <InvisibleLink to={link || '#'}>{artwork}</InvisibleLink>
      <div className={styles.info}>{children}</div>
    </div>
  );
}

export function FakeAlbumCard({
  label,
  onPlay,
}: FakeAlbumCardProps): ReactElement {
  return (
    <BaseAlbumCard
      artwork={
        <ThemedSurpriseArtwork
          overlay={<ArtworkOverlay onTogglePlayPause={onPlay} />}
        />
      }
    >
      <span className={styles.name}>{label}</span>
    </BaseAlbumCard>
  );
}

export function AlbumCard({ album }: AlbumCardProps): ReactElement {
  const [isPlaying, togglePlayPause] = useAlbumPlayState(album.id);

  const albumLink = `/album/${album.id}`;
  const artistLink = `/artist/${album.artist.id}`;

  return (
    <BaseAlbumCard
      artwork={
        <ThemedAlbumArtwork
          id={album.id}
          size={256}
          overlay={
            <ArtworkOverlay
              isPlaying={isPlaying}
              onTogglePlayPause={togglePlayPause}
            />
          }
        />
      }
      link={albumLink}
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
