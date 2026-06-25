import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PasswordChanging from './PasswordChanging';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { ApiError, ChangePasswordRequestDto } from 'leafplayer-common';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PasswordChanging', () => {
  it('successfully changes password', async () => {
    server.use(
      http.post<ChangePasswordRequestDto>('/api/auth/password', () => {
        return HttpResponse.text('', { status: 204 });
      }),
    );

    render(<PasswordChanging />);

    await fillAndSubmitForm();

    await waitFor(() =>
      expect(
        screen.getByText(/you changed your password successfully/i),
      ).toBeInTheDocument(),
    );
  });

  it('displays potential errors', async () => {
    server.use(
      http.post(
        '/api/auth/password',
        () => {
          return HttpResponse.json<ApiError>(
            {
              error: 'Unauthorized',
              message: 'invalid password',
              statusCode: 401,
            },
            { status: 401 },
          );
        },
        { once: true },
      ),
    );

    render(<PasswordChanging />);

    await fillAndSubmitForm();

    await waitFor(() =>
      expect(screen.getByText(/invalid password/i)).toBeInTheDocument(),
    );
  });
});

async function fillAndSubmitForm() {
  const currentPasswordInput = await screen.findByLabelText('Current Password');
  const newPasswordPasswordInput = await screen.findByLabelText('New Password');
  const repeatPasswordInput = await screen.findByLabelText(
    'Repeat New Password',
  );
  const submitButton = await screen.findByRole('button');

  fireEvent.input(currentPasswordInput, {
    target: { value: 'supersecret' },
  });
  fireEvent.input(newPasswordPasswordInput, {
    target: { value: 'timeforachange' },
  });
  fireEvent.input(repeatPasswordInput, {
    target: { value: 'timeforachange' },
  });
  fireEvent.click(submitButton);
}
