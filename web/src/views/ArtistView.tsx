import ApiLoader from 'components/layout/ApiLoader';
import ArtistAppearsOn from 'components/media/ArtistAppearsOn/ArtistAppearsOn';
import ArtistDiscography from 'components/media/ArtistDiscography/ArtistDiscography';
import ArtistHeader from 'components/media/ArtistHeader/ArtistHeader';
import { type ArtistWithAlbumsResponseDto } from 'leafplayer-common';
import { PlayerContext } from 'modules/player/context';
import React, { type ReactElement, useContext } from 'react';
import { useParams } from 'react-router';

function ArtistView(): ReactElement {
  const { id } = useParams<{ id: string }>();

  const [, { addSongsToQueue }] = useContext(PlayerContext);

  return (
    <ApiLoader<ArtistWithAlbumsResponseDto>
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

          {albums.length > 0 && <ArtistDiscography albumsWithSongs={albums} />}

          {appearsOn.length > 0 && <ArtistAppearsOn albums={appearsOn} />}
        </>
      )}
    />
  );
}

export default ArtistView;
