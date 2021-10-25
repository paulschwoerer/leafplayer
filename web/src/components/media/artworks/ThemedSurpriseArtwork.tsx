import SurpriseDay from 'assets/artworks/surprise-day.jpg';
import SurpriseNight from 'assets/artworks/surprise-night.jpg';
import { useThemedUrl } from 'modules/artworks';
import React, { ReactElement } from 'react';
import Artwork from './Artwork/Artwork';

type Props = {
  overlay?: ReactElement;
  isRounded?: boolean;
};

function ThemedSurpriseArtwork({ overlay, isRounded }: Props): ReactElement {
  const url = useThemedUrl(SurpriseDay, SurpriseNight);
  return <Artwork url={url} overlay={overlay} isRounded={isRounded} />;
}

export default ThemedSurpriseArtwork;
