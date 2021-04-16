import React, { ReactElement, useContext } from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export function AuthenticatedRoute(props: RouteProps): ReactElement {
  const authContext = useContext(AuthContext);

  const authenticated = !!authContext.user;

  return authenticated ? <Route {...props} /> : <Redirect to="/login" />;
}

export function NotWhenAuthorizedRoute(props: RouteProps): ReactElement {
  const authContext = useContext(AuthContext);

  const authenticated = !!authContext.user;

  return authenticated ? <Redirect to="/" /> : <Route {...props} />;
}
