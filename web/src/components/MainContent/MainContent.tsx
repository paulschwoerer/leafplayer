import classNames from 'classnames';
import HeaderBar from 'components/layout/HeaderBar/HeaderBar';
import { AuthenticatedRoute } from 'modules/auth';
import React, { ReactElement } from 'react';
import AlbumDetails from 'views/AlbumDetails';
import AllAlbums from 'views/AllAlbums';
import AllArtists from 'views/AllArtists';
import ArtistDetails from 'views/ArtistDetails';
import Landing from 'views/Landing';
import Queue from 'views/Queue';
import Search from 'views/Search';
import UserSettings from 'views/UserSettings';
import styles from './MainContent.module.scss';

type Props = {
  className?: string;
};

function MainContent({ className }: Props): ReactElement {
  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.inner}>
        <HeaderBar />
        <AuthenticatedRoute path="/search" component={Search} />
        <AuthenticatedRoute path="/artists" component={AllArtists} />
        <AuthenticatedRoute path="/artist/:id" component={ArtistDetails} />
        <AuthenticatedRoute path="/albums" component={AllAlbums} />
        <AuthenticatedRoute path="/album/:id" component={AlbumDetails} />
        <AuthenticatedRoute path="/queue" component={Queue} />
        <AuthenticatedRoute path="/settings" component={UserSettings} />
        <AuthenticatedRoute path="/" component={Landing} exact />
      </div>
    </div>
  );
}

export default MainContent;
