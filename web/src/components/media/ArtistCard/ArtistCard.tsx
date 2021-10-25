import AppLink from 'components/layout/AppLink/AppLink';
import { FullArtist } from 'leafplayer-common';
import { PlayerContext } from 'modules/player/context';
import React, { PropsWithChildren, ReactElement, useContext } from 'react';
import InvisibleLink from '../../layout/InvisibleLink/InvisibleLink';
import ArtistCounts from '../ArtistCounts';
import ArtworkOverlay from '../artworks/ArtworkOverlay/ArtworkOverlay';
import ThemedArtistArtwork from '../artworks/ThemedArtistArtwork';
import ThemedSurpriseArtwork from '../artworks/ThemedSurpriseArtwork';
import styles from './ArtistCard.module.scss';

type BaseProps = {
  artwork: ReactElement;
  link?: string;
  isPlaying?: boolean;
  onTogglePlayPause?: () => void;
};

type FakeArtistCardProps = {
  label: string;
  onPlay?: () => void;
};

type ArtistCardProps = {
  artist: FullArtist;
};

function BaseArtistCard({
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

export function FakeArtistCard({
  label,
  onPlay,
}: FakeArtistCardProps): ReactElement {
  return (
    <BaseArtistCard
      artwork={
        <ThemedSurpriseArtwork
          isRounded
          overlay={<ArtworkOverlay onTogglePlayPause={onPlay} />}
        />
      }
    >
      <span className={styles.name}>{label}</span>
    </BaseArtistCard>
  );
}

export function ArtistCard({ artist }: ArtistCardProps): ReactElement {
  const [
    { current, isPlaying },
    { play, pause, addArtistToQueue },
  ] = useContext(PlayerContext);

  async function togglePlayPause() {
    if (current && current.song.artist.id === artist.id) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      await addArtistToQueue(artist.id, {
        replaceQueue: true,
        startPlaying: true,
      });
    }
  }

  const isArtistPlaying =
    isPlaying && !!current && current.song.artist.id === artist.id;

  const artistLink = `/artist/${artist.id}`;

  return (
    <BaseArtistCard
      artwork={
        <ThemedArtistArtwork
          id={artist.id}
          size={256}
          overlay={
            <ArtworkOverlay
              isPlaying={isArtistPlaying}
              onTogglePlayPause={togglePlayPause}
            />
          }
        />
      }
      link={artistLink}
      isPlaying={isArtistPlaying}
      onTogglePlayPause={togglePlayPause}
    >
      <AppLink to={artistLink} title={artist.name} className={styles.name}>
        {artist.name}
      </AppLink>
      <ArtistCounts className={styles.counts} artist={artist} />
    </BaseArtistCard>
  );
}
