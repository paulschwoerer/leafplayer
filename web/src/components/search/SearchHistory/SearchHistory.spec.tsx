import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import SearchHistory from './SearchHistory';
import { type FindSearchHistoryEntriesResponseDto } from 'leafplayer-common';
import { MemoryRouter } from 'react-router';
import { setupMatchMediaMock } from 'helpers/testing/mockMatchMedia';
import { mockAlbum, mockArtist } from 'helpers/testing/mockMedia';

const server = setupServer(
  http.get('/api/search/history', () => {
    return HttpResponse.json<FindSearchHistoryEntriesResponseDto>({
      entries: [
        {
          id: 'id1',
          type: 'album',
          album: mockAlbum('Yellow Album'),
        },
        {
          id: 'id2',
          type: 'artist',
          artist: mockArtist('Yellow Artist'),
        },
      ],
    });
  }),
  http.delete('/api/search/history/id2', () => {
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('SearchHistory', () => {
  setupMatchMediaMock();

  it('renders history entries', async () => {
    render(
      <MemoryRouter>
        <SearchHistory />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText('Yellow Album')).toBeInTheDocument(),
    );
  });

  it('removes a history entry when clicking remove button', async () => {
    render(
      <MemoryRouter>
        <SearchHistory />
      </MemoryRouter>,
    );

    const button = (
      await screen.findAllByLabelText('Remove from search history')
    )[1];

    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.queryByText('Yellow Artist')).not.toBeInTheDocument(),
    );
  });
});
