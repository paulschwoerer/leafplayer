import Input from 'components/form/Input/Input';
import { SearchIcon } from 'components/icons';
import If from 'components/If';
import Carousel from 'components/layout/Carousel/Carousel';
import SectionHeader from 'components/layout/SectionHeader/SectionHeader';
import { AlbumCard } from 'components/media/AlbumCard/AlbumCard';
import { ArtistCard } from 'components/media/ArtistCard/ArtistCard';
import { SongRowWithArtwork } from 'components/media/SongRow/SongRow';
import OptionsPopover from 'components/OptionsPopover/OptionsPopover';
import {
  FullAlbum,
  FullArtist,
  FullSong,
  SearchResponseDto,
} from 'leafplayer-common';
import { isApiError, makeApiGetRequest } from 'modules/api';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';

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
      <Input
        name="search"
        type="search"
        placeholder="e.g. 'Bob Marley'"
        icon={<SearchIcon />}
        value={searchQuery}
        autoFocus
        onInput={ev => setSearchQuery(ev.currentTarget.value)}
      />
      <If condition={results.artists.length > 0}>
        <Carousel headline="Artists">
          {results.artists.map(artist => (
            <ArtistCard artist={artist} key={artist.id} />
          ))}
        </Carousel>
      </If>

      <If condition={results.albums.length > 0}>
        <Carousel headline="Albums">
          {results.albums.map(album => (
            <AlbumCard album={album} key={album.id} />
          ))}
        </Carousel>
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
              <OptionsPopover align="left">
                <OptionsPopover.Option onClick={() => playNext([song])}>
                  Play Next
                </OptionsPopover.Option>
                <OptionsPopover.Option onClick={() => addSongsToQueue([song])}>
                  Enqueue
                </OptionsPopover.Option>
              </OptionsPopover>
            }
          />
        ))}
      </If>
    </>
  );
}

export default Search;
