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
  SearchResults,
} from 'leafplayer-common';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext } from 'react';

type Props = {
  results: SearchResults;
  onArtistClicked: (artist: FullArtist) => void;
  onAlbumClicked: (album: FullAlbum) => void;
  onSongPlayed: (song: FullSong) => void;
};

function SearchResultList({
  results,
  onArtistClicked,
  onAlbumClicked,
  onSongPlayed,
}: Props): ReactElement {
  const [, { addSongsToQueue, playNext }] = useContext(PlayerContext);

  const hasResults =
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.songs.length > 0;

  return (
    <>
      <If condition={!hasResults}>No search results</If>

      <If condition={results.artists.length > 0}>
        <Carousel headline="Artists">
          {results.artists.map(artist => (
            <div key={artist.id} onClick={() => onArtistClicked(artist)}>
              <ArtistCard artist={artist} />
            </div>
          ))}
        </Carousel>
      </If>

      <If condition={results.albums.length > 0}>
        <Carousel headline="Albums">
          {results.albums.map(album => (
            <div key={album.id} onClick={() => onAlbumClicked(album)}>
              <AlbumCard album={album} />
            </div>
          ))}
        </Carousel>
      </If>

      <If condition={results.songs.length > 0}>
        <SectionHeader headline="Songs" />
        {results.songs.map(song => (
          <SongRowWithArtwork
            key={song.id}
            song={song}
            onPlay={() => {
              addSongsToQueue([song], {
                replaceQueue: true,
                startPlaying: true,
              });
              onSongPlayed(song);
            }}
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

export default SearchResultList;
