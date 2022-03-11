import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Card from './Card';

describe('Card', () => {
  it('should render given content', async () => {
    render(<Card>Test</Card>);

    await waitFor(() => expect(screen.getByText(/Test/i)).toBeInTheDocument());
  });

  it('should accept a link as prop and navigate on click', async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Card linkTo="/test">Test</Card>} />
          <Route path="/test" element={<div>It works</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText(/Test/i));

    await waitFor(() =>
      expect(screen.getByText(/It works/i)).toBeInTheDocument(),
    );
  });
});
