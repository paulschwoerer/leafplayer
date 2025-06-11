import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserSettingsView from './UserSettingsView';

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
