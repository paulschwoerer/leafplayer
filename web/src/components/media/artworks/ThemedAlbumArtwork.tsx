import AlbumDefaultDay from 'assets/artworks/album-default-day.jpg';
import AlbumDefaultNight from 'assets/artworks/album-default-night.jpg';
import Artwork from 'components/media/artworks/Artwork/Artwork';
import { useArtworkUrl, useThemedUrl } from 'modules/artworks';
import React, { ReactElement } from 'react';

type Props = {
  id: string;
  size: number;
  overlay?: ReactElement;
};

function ThemedAlbumArtwork({ id, size, overlay }: Props): ReactElement {
  const url = useArtworkUrl({
    id,
    type: 'album',
    size,
  });
  const fallbackUrl = useThemedUrl(AlbumDefaultDay, AlbumDefaultNight);

  return <Artwork url={url} fallbackUrl={fallbackUrl} overlay={overlay} />;
}

export default ThemedAlbumArtwork;
