import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import SearchHistory from './SearchHistory';
import { FindSearchHistoryEntriesResponseDto } from 'leafplayer-common';
import { MemoryRouter } from 'react-router-dom';
import { setupIntersectionObserverMock } from 'helpers/testing/mockIntersectionObserver';
import { setupMatchMediaMock } from 'helpers/testing/mockMatchMedia';
import { mockAlbum, mockArtist } from 'helpers/testing/mockMedia';

const server = setupServer(
  rest.get('/api/search/history', (req, res, ctx) => {
    return res(
      ctx.json<FindSearchHistoryEntriesResponseDto>({
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
      }),
    );
  }),
  rest.delete('/api/search/history/id2', (req, res, ctx) => {
    return res(ctx.status(204));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('SearchHistory', () => {
  setupIntersectionObserverMock();
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
