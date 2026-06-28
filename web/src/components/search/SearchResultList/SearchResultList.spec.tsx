import React from 'react';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import SearchResultList from './SearchResultList';
import { type SearchResults } from 'leafplayer-common';
import { MemoryRouter } from 'react-router';
import { setupMatchMediaMock } from 'helpers/testing/mockMatchMedia';
import { mockAlbum, mockArtist, mockSong } from 'helpers/testing/mockMedia';
import { PlayerProvider } from 'modules/player/PlayerProvider';

describe('SearchResultList', () => {
  setupMatchMediaMock();

  const blueArtist = mockArtist('Blue Artist');
  const redAlbum = mockAlbum('Red Album');
  const longSong = mockSong('Long Song');

  const results: SearchResults = {
    artists: [mockArtist('Green Artist'), blueArtist],
    albums: [redAlbum, mockAlbum('Black Album')],
    songs: [mockSong('Short Song'), longSong],
  };

  it('should call artist handler when clicking on artist', async () => {
    const handler = rstest.fn();

    render(
      <MemoryRouter>
        <SearchResultList
          results={results}
          onArtistClicked={handler}
          onAlbumClicked={rstest.fn()}
          onSongPlayed={rstest.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Blue Artist'));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(blueArtist);
    });
  });

  it('should call album handler when clicking on album', async () => {
    const handler = rstest.fn();

    render(
      <MemoryRouter>
        <SearchResultList
          results={results}
          onArtistClicked={rstest.fn()}
          onAlbumClicked={handler}
          onSongPlayed={rstest.fn()}
        />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Red Album'));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(redAlbum);
    });
  });

  it('should call song handler when clicking on song', async () => {
    const handler = rstest.fn();

    render(
      <MemoryRouter>
        <PlayerProvider>
          <SearchResultList
            results={results}
            onArtistClicked={rstest.fn()}
            onAlbumClicked={rstest.fn()}
            onSongPlayed={handler}
          />
        </PlayerProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByLabelText('Play Song')[1]);

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith(longSong);
    });
  });
});
