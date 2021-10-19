import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PasswordChanging from './PasswordChanging';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ApiError, ChangePasswordRequestDto } from 'leafplayer-common';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PasswordChanging', () => {
  it('successfully changes password', async () => {
    server.use(
      rest.post<ChangePasswordRequestDto>(
        '/api/auth/password',
        (req, res, ctx) => {
          return res(ctx.status(204));
        },
      ),
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
      rest.post('/api/auth/password', (req, res, ctx) => {
        return res.once(
          ctx.status(401),
          ctx.json<ApiError>({
            error: 'Unauthorized',
            message: 'invalid password',
            statusCode: 401,
          }),
        );
      }),
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
