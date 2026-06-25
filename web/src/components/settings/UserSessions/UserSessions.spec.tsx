import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { throwNotImplemented } from 'helpers/context';
import { type UserSessionsResponseDto } from 'leafplayer-common';
import { AuthContext } from 'modules/auth';
import { NotificationContext } from 'modules/notifications/NotificationContext';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import UserSessions from './UserSessions';

const server = setupServer(
  http.get('/api/auth/sessions', () => {
    return HttpResponse.json<UserSessionsResponseDto>({
      sessions: [
        {
          id: '1',
          userId: 'user1',
          browser: 'Firefox',
          os: 'Windows',
          lastUsedAt: Date.now(),
        },
        {
          id: '2',
          userId: 'user1',
          browser: 'Firefox',
          os: 'Linux',
          lastUsedAt: 1621442580,
        },
      ],
      currentSessionId: '1',
    });
  }),
  http.delete('/api/auth/sessions/2', () => {
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays current user session', async () => {
  render(<UserSessions />);

  await waitFor(() =>
    expect(screen.getByText('Your current session')).toBeInTheDocument(),
  );
});

test('displays a sessions browser and OS', async () => {
  render(<UserSessions />);

  await waitFor(() =>
    expect(screen.getByText('Firefox on Linux')).toBeInTheDocument(),
  );
});

test('displays the last time a session was accessed', async () => {
  render(<UserSessions />);

  await waitFor(() =>
    expect(screen.getByText('Last accessed on 19/05/2021')).toBeInTheDocument(),
  );
});

test('can revoke a session', async () => {
  const mockNotification = rstest.fn();

  render(
    <NotificationContext.Provider
      value={{
        showNotification: mockNotification,
      }}
    >
      <UserSessions />
    </NotificationContext.Provider>,
  );

  const revokeButton = await screen.findByRole('button', {
    name: 'Revoke session',
  });

  fireEvent.click(revokeButton);

  await waitFor(() =>
    expect(mockNotification).toHaveBeenCalledWith({
      title: 'Session revoked',
      message: 'The session was successfully revoked',
    }),
  );
});

test('can logout of the current session', async () => {
  const mockLogout = rstest.fn();

  render(
    <AuthContext.Provider
      value={{
        logout: mockLogout,
        artworkToken: null,
        user: null,
        storeArtworkToken: () => throwNotImplemented,
        storeUser: () => throwNotImplemented,
      }}
    >
      <UserSessions />
    </AuthContext.Provider>,
  );

  const logoutButton = await screen.findByRole('button', { name: 'Logout' });

  fireEvent.click(logoutButton);

  await waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
});
