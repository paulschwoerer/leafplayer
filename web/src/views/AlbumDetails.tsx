import HistoryNavigation from 'components/HistoryNavigation/HistoryNavigation';
import ApiLoader from 'components/layout/ApiLoader';
import AlbumWithSongs from 'components/media/AlbumWithSongs/AlbumWithSongs';
import { AlbumWithSongsResponseDto } from 'leafplayer-common';
import React, { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

function AlbumDetails(): ReactElement {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <HistoryNavigation />
      <ApiLoader<AlbumWithSongsResponseDto>
        slug={`albums/${id}`}
        renderContent={({ album, songs }) => (
          <AlbumWithSongs album={album} songs={songs} hideArtist={false} />
        )}
      />
    </>
  );
}

export default AlbumDetails;
