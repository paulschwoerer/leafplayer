import Input from 'components/form/Input/Input';
import { SearchIcon } from 'components/icons';
import SearchHistory from 'components/search/SearchHistory/SearchHistory';
import SearchResultList from 'components/search/SearchResultList/SearchResultList';
import {
  CreateSearchHistoryEntryRequestDto,
  CreateSearchHistoryEntryResponseDto,
  SearchResponseDto,
  SearchResults,
} from 'leafplayer-common';
import { isApiError, makeApiGetRequest, makeApiPostRequest } from 'modules/api';
import React, { ReactElement, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

const emptyResults = {
  albums: [],
  artists: [],
  songs: [],
};

export function useSearchQuery(): [string, (query: string) => void] {
  const { pathname } = useLocation();
  const history = useHistory();
  const pathParts = pathname.split('/');

  function setSearchQuery(query: string) {
    if (pathname.split('/')[1] === 'search') {
      history.replace(`/search/${query}`);
    } else {
      history.push(`/search/${query}`);
    }
  }

  if (pathParts.length === 3 && pathParts[1] === 'search') {
    return [pathParts[pathParts.length - 1], setSearchQuery];
  }

  return ['', setSearchQuery];
}

function Search(): ReactElement {
  const [searchQuery, setSearchQuery] = useSearchQuery();
  const [results, setResults] = useState<SearchResults>(emptyResults);

  async function storeHistoryEntry(
    forType: 'artist' | 'album' | 'song',
    forId: string,
  ) {
    await makeApiPostRequest<
      CreateSearchHistoryEntryResponseDto,
      CreateSearchHistoryEntryRequestDto
    >('search/history', {
      forType,
      forId,
    });
  }

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
      <Input
        name="search"
        type="search"
        placeholder="e.g. 'Bob Marley'"
        icon={<SearchIcon />}
        value={searchQuery}
        autoFocus
        onInput={ev => setSearchQuery(ev.currentTarget.value)}
      />

      {searchQuery ? (
        <SearchResultList
          results={results}
          onArtistClicked={artist => storeHistoryEntry('artist', artist.id)}
          onAlbumClicked={album => storeHistoryEntry('album', album.id)}
          onSongPlayed={song => storeHistoryEntry('song', song.id)}
        />
      ) : (
        <SearchHistory />
      )}
    </>
  );
}

export default Search;
