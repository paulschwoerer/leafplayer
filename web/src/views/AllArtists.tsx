import SearchInput from 'components/form/SearchInput/SearchInput';
import ApiLoader from 'components/layout/ApiLoader';
import ViewHeader from 'components/layout/ViewHeader/ViewHeader';
import WaterfallLayout from 'components/layout/WaterfallLayout/WaterfallLayout';
import { ArtistCard } from 'components/media/ArtistCard/ArtistCard';
import EmptyLibrary from 'components/media/EmptyLibrary/EmptyLibrary';
import { ArtistsResponseDto } from 'leafplayer-common';
import React, { ReactElement, useState } from 'react';

function AllArtists(): ReactElement {
  const [filter, setFilter] = useState('');

  return (
    <>
      <ViewHeader
        headline="Artists"
        content={
          <SearchInput
            placeholder="Search"
            value={filter}
            onChange={setFilter}
          />
        }
      />

      <ApiLoader<ArtistsResponseDto>
        slug="artists"
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
