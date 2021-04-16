import SearchInput from 'components/form/SearchInput/SearchInput';
import If from 'components/If';
import SectionHeader from 'components/layout/SectionHeader/SectionHeader';
import WaterfallLayout from 'components/layout/WaterfallLayout/WaterfallLayout';
import { AlbumCard } from 'components/media/AlbumCard/AlbumCard';
import { ArtistCard } from 'components/media/ArtistCard/ArtistCard';
import { SongRowWithArtwork } from 'components/media/SongRow/SongRow';
import OptionsDropdown from 'components/OptionsDropdown/OptionsDropdown';
import {
  FullAlbum,
  FullArtist,
  FullSong,
  SearchResponseDto,
} from 'leafplayer-common';
import { isApiError, makeApiGetRequest } from 'modules/api';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext, useEffect, useState } from 'react';

type Results = {
  albums: FullAlbum[];
  artists: FullArtist[];
  songs: FullSong[];
};

const emptyResults = {
  albums: [],
  artists: [],
  songs: [],
};

function Search(): ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Results>(emptyResults);
  const [, { addSongsToQueue, playNext }] = useContext(PlayerContext);

  useEffect(() => {
    if (searchQuery.length === 0) {
      setResults(emptyResults);
      return;
    }

    makeApiGetRequest<SearchResponseDto>(`search?q=${searchQuery}`)
      .then(response => {
        if (isApiError(response)) {
          console.error(response.message);
        } else {
          setResults(response.results);
        }
      })
      .catch(console.error);
  }, [searchQuery]);

  return (
    <>
      <SearchInput
        placeholder="Search library"
        value={searchQuery}
        onChange={setSearchQuery}
        autoFocus
      />

      <If condition={results.artists.length > 0}>
        <SectionHeader headline="Artists" />
        <WaterfallLayout>
          {results.artists.map(artist => (
            <ArtistCard artist={artist} key={artist.id} />
          ))}
        </WaterfallLayout>
      </If>

      <If condition={results.albums.length > 0}>
        <SectionHeader headline="Albums" />
        <WaterfallLayout>
          {results.albums.map(album => (
            <AlbumCard album={album} key={album.id} />
          ))}
        </WaterfallLayout>
      </If>

      <If condition={results.songs.length > 0}>
        <SectionHeader headline="Songs" />
        {results.songs.map(song => (
          <SongRowWithArtwork
            key={song.id}
            song={song}
            onPlay={() =>
              addSongsToQueue([song], {
                replaceQueue: true,
                startPlaying: true,
              })
            }
            options={
              <OptionsDropdown align="right">
                <OptionsDropdown.Option onClick={() => playNext([song])}>
                  Play Next
                </OptionsDropdown.Option>
                <OptionsDropdown.Option onClick={() => addSongsToQueue([song])}>
                  Enqueue
                </OptionsDropdown.Option>
              </OptionsDropdown>
            }
          />
        ))}
      </If>
    </>
  );
}

export default Search;
