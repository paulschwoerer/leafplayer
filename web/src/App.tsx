import React, { ReactElement } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './views/Login';
import {
  AuthenticatedRoute,
  AuthProvider,
  NotWhenAuthorizedRoute,
} from './modules/auth';
import Wrapper from './components/Wrapper/Wrapper';
import Register from './views/Register';
import { NotificationProvider } from 'modules/notifications/NotificationProvider';

function App(): ReactElement {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <Switch>
            <NotWhenAuthorizedRoute exact path="/login" component={Login} />
            <NotWhenAuthorizedRoute
              exact
              path="/register"
              component={Register}
            />

            <AuthenticatedRoute path="/" component={Wrapper} />

            <Route render={() => <span>404 Not found</span>}></Route>
          </Switch>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
