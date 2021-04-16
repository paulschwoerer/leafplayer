import RoundButton from 'components/form/RoundButton/RoundButton';
import { ReloadIcon } from 'components/icons';
import ApiLoader from 'components/layout/ApiLoader';
import SectionHeader from 'components/layout/SectionHeader/SectionHeader';
import ViewHeader from 'components/layout/ViewHeader/ViewHeader';
import WaterfallLayout from 'components/layout/WaterfallLayout/WaterfallLayout';
import { AlbumCard, FakeAlbumCard } from 'components/media/AlbumCard/AlbumCard';
import {
  ArtistCard,
  FakeArtistCard,
} from 'components/media/ArtistCard/ArtistCard';
import EmptyLibrary from 'components/media/EmptyLibrary/EmptyLibrary';
import { AlbumsResponseDto, ArtistsResponseDto } from 'leafplayer-common';
import { isApiError, makeApiGetRequest } from 'modules/api';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';

function Landing(): ReactElement {
  const [, { addAlbumToQueue, addArtistToQueue }] = useContext(PlayerContext);

  async function loadRandomAlbum() {
    const response = await makeApiGetRequest<AlbumsResponseDto>(
      'albums/random?count=1',
    );

    if (!isApiError(response)) {
      const album = response.albums[0];

      if (!album) {
        throw new Error('no album returned');
      }

      await addAlbumToQueue(album.id, {
        replaceQueue: true,
        startPlaying: true,
      });
    }
  }

  async function loadRandomArtist() {
    const response = await makeApiGetRequest<ArtistsResponseDto>(
      'artists/random?count=1',
    );

    if (!isApiError(response)) {
      const artist = response.artists[0];

      if (!artist) {
        throw new Error('no artist returned');
      }

      await addArtistToQueue(artist.id, {
        replaceQueue: true,
        startPlaying: true,
      });
    }
  }

  return (
    <>
      <ViewHeader headline="Explore" />

      <ApiLoader<AlbumsResponseDto>
        slug="albums/random"
        useCachedData
        renderContent={({ albums }, reload) => {
          if (albums.length === 0) {
            return <EmptyLibrary />;
          }

          return (
            <>
              <SectionHeader headline="Albums you might like">
                <RoundButton
                  icon={<ReloadIcon />}
                  onClick={reload}
                  withBorder
                />
              </SectionHeader>
              <WaterfallLayout>
                {albums.map(album => (
                  <AlbumCard key={album.id} album={album} />
                ))}
                <FakeAlbumCard label="Surprise me" onPlay={loadRandomAlbum} />
              </WaterfallLayout>
            </>
          );
        }}
      />

      <ApiLoader<ArtistsResponseDto>
        slug="artists/random"
        useCachedData
        renderContent={({ artists }, reload) => {
          if (artists.length === 0) {
            return <EmptyLibrary />;
          }

          return (
            <>
              <SectionHeader headline="Artists you might like">
                <RoundButton
                  icon={<ReloadIcon />}
                  onClick={reload}
                  withBorder
                />
              </SectionHeader>
              <WaterfallLayout>
                {artists.map(artist => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
                <FakeArtistCard label="Surprise me" onPlay={loadRandomArtist} />
              </WaterfallLayout>
            </>
          );
        }}
      />
    </>
  );
}

export default Landing;
