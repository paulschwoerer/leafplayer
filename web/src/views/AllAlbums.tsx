import SearchInput from 'components/form/SearchInput/SearchInput';
import ApiLoader from 'components/layout/ApiLoader';
import ViewHeader from 'components/layout/ViewHeader/ViewHeader';
import WaterfallLayout from 'components/layout/WaterfallLayout/WaterfallLayout';
import { AlbumCard } from 'components/media/AlbumCard/AlbumCard';
import EmptyLibrary from 'components/media/EmptyLibrary/EmptyLibrary';
import { AlbumsResponseDto } from 'leafplayer-common';
import React, { ReactElement, useState } from 'react';

function AllAlbums(): ReactElement {
  const [filter, setFilter] = useState('');

  return (
    <>
      <ViewHeader
        headline="Albums"
        content={
          <SearchInput
            placeholder="Search"
            value={filter}
            onChange={setFilter}
          />
        }
      />

      <ApiLoader<AlbumsResponseDto>
        slug="albums"
        renderContent={({ albums }) => {
          if (albums.length === 0) {
            return <EmptyLibrary />;
          }

          const filteredAlbums = albums.filter(album => {
            if (filter.length < 2) {
              return album;
            }

            return (
              album.name.toLowerCase().includes(filter.toLowerCase()) ||
              album.artist.name.toLowerCase().includes(filter.toLowerCase())
            );
          });

          return (
            <WaterfallLayout>
              {filteredAlbums.map(album => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </WaterfallLayout>
          );
        }}
      />
    </>
  );
}

export default AllAlbums;
