import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders the given message', async () => {
    render(<Alert message="this is a message" />);

    await waitFor(() =>
      expect(screen.getByText('this is a message')).toBeInTheDocument(),
    );
  });

  it('calls close handler when close button is clicked', async () => {
    const handleClose = jest.fn();

    render(<Alert message="this is a message" onClose={handleClose} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(handleClose).toHaveBeenCalled());
  });
});
