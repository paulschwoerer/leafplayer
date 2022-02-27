import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Card from './Card';
import { Route, Router, Switch } from 'react-router-dom';
import { createMemoryHistory } from 'history';

describe('Card', () => {
  it('should render given content', async () => {
    render(<Card>Test</Card>);

    await waitFor(() => expect(screen.getByText(/Test/i)).toBeInTheDocument());
  });

  it('should accept a link as prop and navigate on click', async () => {
    const history = createMemoryHistory();

    render(
      <Router history={history}>
        <Switch>
          <Route exact path="/">
            <Card linkTo="/test">Test</Card>
          </Route>
          <Route exact path="/test">
            <div>It works</div>
          </Route>
        </Switch>
      </Router>,
    );

    fireEvent.click(screen.getByText(/Test/i));

    await waitFor(() =>
      expect(screen.getByText(/It works/i)).toBeInTheDocument(),
    );
  });
});
