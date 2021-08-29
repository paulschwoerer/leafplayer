import Input from 'components/form/Input/Input';
import { SearchIcon } from 'components/icons';
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
      <ViewHeader headline="Albums" />

      <Input
        name="search"
        icon={<SearchIcon />}
        placeholder="Search Albums"
        value={filter}
        onInput={ev => setFilter(ev.currentTarget.value)}
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

            return album.name.toLowerCase().includes(filter.toLowerCase());
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
