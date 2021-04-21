import { ButtonText } from 'components/form/Button/Button';
import { ReloadIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import ApiLoader from 'components/layout/ApiLoader';
import Carousel from 'components/layout/Carousel/Carousel';
import SectionHeader from 'components/layout/SectionHeader/SectionHeader';
import Spacer from 'components/layout/Spacer/Spacer';
import ViewHeader from 'components/layout/ViewHeader/ViewHeader';
import { AlbumCard, FakeAlbumCard } from 'components/media/AlbumCard/AlbumCard';
import {
  ArtistCard,
  FakeArtistCard,
} from 'components/media/ArtistCard/ArtistCard';
import EmptyLibrary from 'components/media/EmptyLibrary/EmptyLibrary';
import {
  AlbumResponseDto,
  AlbumsResponseDto,
  ArtistResponseDto,
  ArtistsResponseDto,
} from 'leafplayer-common';
import { isApiError, makeApiGetRequest } from 'modules/api';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';

function Landing(): ReactElement {
  const [, { addAlbumToQueue, addArtistToQueue }] = useContext(PlayerContext);

  return (
    <>
      <ViewHeader headline="Explore" />

      <ApiLoader<AlbumsResponseDto>
        slug="discover/recent"
        renderContent={({ albums }) => (
          <>
            <SectionHeader headline="Recently added Albums" />
            {albums.length ? (
              <Carousel>
                {albums.map(album => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </Carousel>
            ) : (
              <EmptyLibrary />
            )}
          </>
        )}
      />

      <Spacer />

      <ApiLoader<AlbumsResponseDto>
        slug="discover/albums"
        useCachedData
        renderContent={({ albums }, reload) => (
          <>
            <SectionHeader headline="Albums you might like">
              <ButtonText onClick={reload}>
                Refresh
                <Icon icon={<ReloadIcon />} />
              </ButtonText>
            </SectionHeader>
            {albums.length ? (
              <Carousel>
                <FakeAlbumCard label="Surprise me" onPlay={playRandomAlbum} />
                {albums.map(album => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </Carousel>
            ) : (
              <EmptyLibrary />
            )}
          </>
        )}
      />

      <Spacer />

      <ApiLoader<ArtistsResponseDto>
        slug="discover/artists"
        useCachedData
        renderContent={({ artists }, reload) => (
          <>
            <SectionHeader headline="Artists you might like">
              <ButtonText onClick={reload}>
                Refresh
                <Icon icon={<ReloadIcon />} />
              </ButtonText>
            </SectionHeader>
            {artists.length ? (
              <Carousel>
                <FakeArtistCard label="Surprise me" onPlay={playRandomArtist} />
                {artists.map(artist => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </Carousel>
            ) : (
              <EmptyLibrary />
            )}
          </>
        )}
      />
    </>
  );

  async function playRandomAlbum() {
    const response = await makeApiGetRequest<AlbumResponseDto>(
      'discover/album',
    );

    if (!isApiError(response)) {
      const { album } = response;

      await addAlbumToQueue(album.id, {
        replaceQueue: true,
        startPlaying: true,
      });
    }
  }

  async function playRandomArtist() {
    const response = await makeApiGetRequest<ArtistResponseDto>(
      'discover/artist',
    );

    if (!isApiError(response)) {
      const { artist } = response;

      await addArtistToQueue(artist.id, {
        replaceQueue: true,
        startPlaying: true,
      });
    }
  }
}

export default Landing;
