import Input from 'components/form/Input/Input';
import Select from 'components/form/Select/Select';
import { SearchIcon } from 'components/icons';
import ApiLoader from 'components/layout/ApiLoader';
import FilterSearchWrapper from 'components/layout/FilterSearchWrapper/FilterSearchWrapper';
import ViewHeader from 'components/layout/ViewHeader/ViewHeader';
import WaterfallLayout from 'components/layout/WaterfallLayout/WaterfallLayout';
import { AlbumCard } from 'components/media/AlbumCard/AlbumCard';
import EmptyLibrary from 'components/media/EmptyLibrary/EmptyLibrary';
import { AlbumsResponseDto } from 'leafplayer-common';
import React, { ReactElement, useState } from 'react';

const sortByOptions = [
  { label: 'Alphabetical', value: 'asc(name)' },
  { label: 'Recently Added', value: 'desc(createdAt)' },
  { label: 'Newest First', value: 'desc(year)' },
  { label: 'Oldest First', value: 'asc(year)' },
];

function AllAlbums(): ReactElement {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState(sortByOptions[0]);

  const slug = `albums?sort=${sortBy.value}`;

  return (
    <>
      <ViewHeader headline="Albums" />

      <FilterSearchWrapper>
        <Input
          name="search"
          icon={<SearchIcon />}
          placeholder="Search Albums"
          value={filter}
          onInput={ev => setFilter(ev.currentTarget.value)}
        />

        <Select value={sortBy} options={sortByOptions} onChange={setSortBy} />
      </FilterSearchWrapper>

      <ApiLoader<AlbumsResponseDto>
        slug={slug}
        renderContent={({ albums }) => {
          if (albums.length === 0) {
            return <EmptyLibrary />;
          }

          const filtered = albums.filter(album =>
            album.name.toLowerCase().includes(filter.toLowerCase()),
          );

          return (
            <WaterfallLayout>
              {filtered.map(album => (
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
