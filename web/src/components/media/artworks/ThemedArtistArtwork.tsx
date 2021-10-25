import ArtistDefaultDay from 'assets/artworks/artist-default-day.jpg';
import ArtistDefaultNight from 'assets/artworks/artist-default-night.jpg';
import Artwork from 'components/media/artworks/Artwork/Artwork';
import { useArtworkUrl, useThemedUrl } from 'modules/artworks';
import React, { ReactElement } from 'react';

type Props = {
  id: string;
  size: number;
  overlay?: ReactElement;
};

function ThemedArtistArtwork({ id, size, overlay }: Props): ReactElement {
  const url = useArtworkUrl({
    id,
    type: 'artist',
    size,
  });
  const fallbackUrl = useThemedUrl(ArtistDefaultDay, ArtistDefaultNight);

  return (
    <Artwork url={url} fallbackUrl={fallbackUrl} overlay={overlay} isRounded />
  );
}

export default ThemedArtistArtwork;
