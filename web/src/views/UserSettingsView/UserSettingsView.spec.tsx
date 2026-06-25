import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserSettingsView from './UserSettingsView';
import type { UserSessionsResponseDto } from 'leafplayer-common';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/auth/sessions', () => {
    return HttpResponse.json<UserSessionsResponseDto>({
      currentSessionId: '',
      sessions: [],
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserSettingsView', () => {
  it('renders password changing form', async () => {
    render(<UserSettingsView />);

    await waitFor(() => {
      expect(screen.getByText(/change your password/i)).toBeInTheDocument();
    });
  });

  it('renders user sessions', async () => {
    render(<UserSettingsView />);

    await waitFor(() => {
      expect(screen.getByText(/your sessions/i)).toBeInTheDocument();
    });
  });
});
