import { FullAlbum } from 'leafplayer-common';
import React, { ReactElement } from 'react';
import { AlbumCard } from '../AlbumCard/AlbumCard';
import SectionHeader from '../../layout/SectionHeader/SectionHeader';
import WaterfallLayout from '../../layout/WaterfallLayout/WaterfallLayout';

type Props = {
  albums: FullAlbum[];
};

function ArtistAppearsOn({ albums }: Props): ReactElement | null {
  return (
    <div>
      <SectionHeader headline="Appears on" />
      <WaterfallLayout>
        {albums.map(album => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </WaterfallLayout>
    </div>
  );
}

export default ArtistAppearsOn;
