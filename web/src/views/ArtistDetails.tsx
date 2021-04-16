import HistoryNavigation from 'components/HistoryNavigation/HistoryNavigation';
import ApiLoader from 'components/layout/ApiLoader';
import ArtistAppearsOn from 'components/media/ArtistAppearsOn/ArtistAppearsOn';
import ArtistDiscography from 'components/media/ArtistDiscography/ArtistDiscography';
import ArtistHeader from 'components/media/ArtistHeader/ArtistHeader';
import { ArtistResponseDto } from 'leafplayer-common';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';
import { useParams } from 'react-router-dom';

function ArtistDetails(): ReactElement {
  const { id } = useParams<{ id: string }>();

  const [, { addSongsToQueue }] = useContext(PlayerContext);

  return (
    <>
      <HistoryNavigation />

      <ApiLoader<ArtistResponseDto>
        slug={`artists/${id}`}
        renderContent={({ artist, albums, appearsOn }) => (
          <>
            <ArtistHeader
              artist={artist}
              onPlayClicked={() =>
                addSongsToQueue(
                  albums.flatMap(album => album.songs),
                  { replaceQueue: true, startPlaying: true },
                )
              }
            />

            {albums.length > 0 && (
              <ArtistDiscography albumsWithSongs={albums} />
            )}

            {appearsOn.length > 0 && <ArtistAppearsOn albums={appearsOn} />}
          </>
        )}
      />
    </>
  );
}

export default ArtistDetails;
