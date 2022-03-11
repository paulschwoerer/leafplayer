import { NotificationProvider } from 'modules/notifications/NotificationProvider';
import { ThemeProvider } from 'modules/theming/ThemeProvider';
import React, { ReactElement, useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AlbumDetails from 'views/AlbumDetails';
import AllAlbums from 'views/AllAlbums';
import AllArtists from 'views/AllArtists';
import ArtistDetails from 'views/ArtistDetails';
import Landing from 'views/Landing';
import Queue from 'views/Queue';
import Search from 'views/Search';
import UserSettings from 'views/UserSettings/UserSettings';
import Wrapper from './components/Wrapper/Wrapper';
import { AuthContext, AuthProvider } from './modules/auth';
import Login from './views/Login';
import Register from './views/Register';

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
                  <Route index element={<Landing />} />
                  <Route path="/search/*" element={<Search />} />
                  <Route path="/artists" element={<AllArtists />} />
                  <Route path="/artist/:id" element={<ArtistDetails />} />
                  <Route path="/albums" element={<AllAlbums />} />
                  <Route path="/album/:id" element={<AlbumDetails />} />
                  <Route path="/queue" element={<Queue />} />
                  <Route path="/settings" element={<UserSettings />} />
                </Route>
              </Route>

              {/* unauthenticated routes */}
              <Route element={<UnauthenticatedWrapper />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
