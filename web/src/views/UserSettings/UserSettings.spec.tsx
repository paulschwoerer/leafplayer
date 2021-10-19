import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserSettings from './UserSettings';

describe('UserSettings', () => {
  it('renders password changing form', async () => {
    render(<UserSettings />);

    await waitFor(() => {
      expect(screen.getByText(/change your password/i)).toBeInTheDocument();
    });
  });

  it('renders user sessions', async () => {
    render(<UserSettings />);

    await waitFor(() => {
      expect(screen.getByText(/your sessions/i)).toBeInTheDocument();
    });
  });
});
