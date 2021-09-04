import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { throwNotImplemented } from 'helpers/context';
import {
  RevokeSessionRequestDto,
  UserSessionsResponseDto,
} from 'leafplayer-common';
import { AuthContext } from 'modules/auth';
import { NotificationContext } from 'modules/notifications/NotificationContext';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import UserSessions from './UserSessions';

const server = setupServer(
  rest.get('/api/sessions', (req, res, ctx) => {
    return res(
      ctx.json<UserSessionsResponseDto>({
        sessions: [
          {
            id: '1',
            browser: 'Firefox',
            os: 'Windows',
            lastUsedAt: Date.now(),
          },
          {
            id: '2',
            browser: 'Firefox',
            os: 'Linux',
            lastUsedAt: 1621442580,
          },
        ],
        currentSessionId: '1',
      }),
    );
  }),
  rest.delete<RevokeSessionRequestDto>('/api/sessions/2', (req, res, ctx) => {
    if (req.body.password !== 'supersecret') {
      return res(ctx.status(401));
    }

    return res(ctx.status(204));
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
    expect(screen.getByText('Last accessed on 5/19/2021')).toBeInTheDocument(),
  );
});

test('can revoke a session', async () => {
  const mockNotification = jest.fn();

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

  const passwordInput = await screen.findByLabelText('Password');

  fireEvent.input(passwordInput, {
    target: { value: 'supersecret' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));

  await waitFor(() =>
    expect(mockNotification).toHaveBeenCalledWith({
      title: 'Session revoked',
      message: 'The session was successfully revoked',
    }),
  );
});

test('can logout of the current session', async () => {
  const mockLogout = jest.fn();

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
