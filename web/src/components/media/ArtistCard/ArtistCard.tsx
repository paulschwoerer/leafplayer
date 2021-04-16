import DefaultArtistImage from 'assets/artist-default.jpg';
import RandomImage from 'assets/random.jpg';
import AppLink from 'components/layout/AppLink/AppLink';
import { FullArtist } from 'leafplayer-common';
import { useArtworkUrl } from 'modules/api';
import { PlayerContext } from 'modules/player/context';
import React, { PropsWithChildren, ReactElement, useContext } from 'react';
import InvisibleLink from '../../layout/InvisibleLink/InvisibleLink';
import ArtistCounts from '../ArtistCounts';
import Artwork from '../Artwork/Artwork';
import styles from './ArtistCard.module.scss';

type BaseProps = {
  artworkUrl: string;
  fallbackUrl?: string;
  artworkLink?: string;
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
          isRounded
        />
      </InvisibleLink>
      <div className={styles.info}>{children}</div>
    </div>
  );
}

export function FakeArtistCard({
  label,
  onPlay,
}: FakeArtistCardProps): ReactElement {
  return (
    <BaseArtistCard artworkUrl={RandomImage} onTogglePlayPause={onPlay}>
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
  const artworkUrl = useArtworkUrl({
    type: 'artist',
    id: artist.id,
    size: 256,
  });

  return (
    <BaseArtistCard
      artworkUrl={artworkUrl}
      artworkLink={artistLink}
      fallbackUrl={DefaultArtistImage}
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
