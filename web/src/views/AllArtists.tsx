import Input from 'components/form/Input/Input';
import Select from 'components/form/Select/Select';
import { SearchIcon } from 'components/icons';
import ApiLoader from 'components/layout/ApiLoader';
import FilterSearchWrapper from 'components/layout/FilterSearchWrapper/FilterSearchWrapper';
import ViewHeader from 'components/layout/ViewHeader/ViewHeader';
import WaterfallLayout from 'components/layout/WaterfallLayout/WaterfallLayout';
import { ArtistCard } from 'components/media/ArtistCard/ArtistCard';
import EmptyLibrary from 'components/media/EmptyLibrary/EmptyLibrary';
import { ArtistsResponseDto } from 'leafplayer-common';
import React, { ReactElement, useState } from 'react';

const sortByOptions = [
  { label: 'Alphabetical', value: 'asc(name)' },
  { label: 'Recently Added', value: 'desc(createdAt)' },
];

function AllArtists(): ReactElement {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState(sortByOptions[0]);

  const slug = `artists?sort=${sortBy.value}`;

  return (
    <>
      <ViewHeader headline="Artists" />

      <FilterSearchWrapper>
        <Input
          name="search"
          icon={<SearchIcon />}
          placeholder="Search Artists"
          value={filter}
          onInput={ev => setFilter(ev.currentTarget.value)}
        />

        <Select value={sortBy} options={sortByOptions} onChange={setSortBy} />
      </FilterSearchWrapper>

      <ApiLoader<ArtistsResponseDto>
        slug={slug}
        renderContent={({ artists }) => {
          if (artists.length === 0) {
            return <EmptyLibrary />;
          }

          const filteredArtists = artists.filter(artist => {
            if (filter.length < 2) {
              return artist;
            }

            return artist.name.toLowerCase().includes(filter.toLowerCase());
          });

          return (
            <WaterfallLayout>
              {filteredArtists.map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </WaterfallLayout>
          );
        }}
      />
    </>
  );
}

export default AllArtists;
