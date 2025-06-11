import { NotificationProvider } from 'modules/notifications/NotificationProvider';
import { ThemeProvider } from 'modules/theming/ThemeProvider';
import React, { ReactElement, useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AlbumView from 'views/AlbumView';
import AllAlbumsView from 'views/AllAlbumsView';
import AllArtistsView from 'views/AllArtistsView';
import ArtistView from 'views/ArtistView';
import LandingView from 'views/LandingView';
import QueueView from 'views/QueueView';
import SearchView from 'views/SearchView';
import UserSettingsView from 'views/UserSettingsView/UserSettingsView';
import Wrapper from './components/Wrapper/Wrapper';
import { AuthContext, AuthProvider } from './modules/auth';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';

function AuthenticatedWrapper() {
  const authContext = useContext(AuthContext);
  const isAuthenticated = !!authContext.user;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

function UnauthenticatedWrapper() {
  const authContext = useContext(AuthContext);
  const isAuthenticated = !!authContext.user;

  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
}

function App(): ReactElement {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* authenticated routes */}
              <Route element={<AuthenticatedWrapper />}>
                <Route element={<Wrapper />}>
                  <Route index element={<LandingView />} />
                  <Route path="/search/*" element={<SearchView />} />
                  <Route path="/artists" element={<AllArtistsView />} />
                  <Route path="/artist/:id" element={<ArtistView />} />
                  <Route path="/albums" element={<AllAlbumsView />} />
                  <Route path="/album/:id" element={<AlbumView />} />
                  <Route path="/queue" element={<QueueView />} />
                  <Route path="/settings" element={<UserSettingsView />} />
                </Route>
              </Route>

              {/* unauthenticated routes */}
              <Route element={<UnauthenticatedWrapper />}>
                <Route path="/login" element={<LoginView />} />
                <Route path="/register" element={<RegisterView />} />
              </Route>

              <Route path="*" element={<span>404 Not found</span>} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
