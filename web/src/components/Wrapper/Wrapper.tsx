import classNames from 'classnames';
import {
  AlbumIcon,
  ArtistsIcon,
  ExploreIcon,
  SettingsIcon,
} from 'components/icons';
import MobileMenu from 'components/mobile/MobileMenu/MobileMenu';
import MobilePlayer from 'components/player/MobilePlayer/MobilePlayer';
import MobilePlayerBar from 'components/player/MobilePlayerBar/MobilePlayerBar';
import { PlayerProvider } from 'modules/player/PlayerProvider';
import React, { ReactElement, useState } from 'react';
import MainContent from '../MainContent/MainContent';
import DesktopPlayerBar from '../player/DesktopPlayerBar/DesktopPlayerBar';
import DesktopSidebar from '../sidebar/DesktopSidebar/DesktopSidebar';
import styles from './Wrapper.module.scss';

const navEntries = [
  {
    label: 'Explore',
    icon: <ExploreIcon />,
    to: '/',
    exact: true,
  },
  {
    label: 'Artists',
    icon: <ArtistsIcon />,
    to: '/artists',
  },
  {
    label: 'Albums',
    icon: <AlbumIcon />,
    to: '/albums',
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    to: '/settings',
  },
];

function Wrapper(): ReactElement {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobilePlayerExpanded, setIsMobilePlayerExpanded] = useState(false);

  return (
    <div className={styles.root}>
      <div
        className={classNames(styles.mobileMenuOverlay, {
          [styles.visible]: isSidebarExpanded,
        })}
        onClick={() => setIsSidebarExpanded(false)}
      />

      <PlayerProvider>
        <MobileMenu nav={navEntries} className={styles.mobileMenu} />
        <MobilePlayerBar
          className={styles.mobilePlayerBar}
          onClick={() => setIsMobilePlayerExpanded(true)}
        />
        {isMobilePlayerExpanded && (
          <MobilePlayer onClose={() => setIsMobilePlayerExpanded(false)} />
        )}

        <div className={styles.layout}>
          <DesktopSidebar
            nav={navEntries}
            className={styles.desktopSidebar}
            onClick={() => setIsSidebarExpanded(false)}
          />
          <MainContent className={styles.main} />
          <DesktopPlayerBar className={styles.desktopPlayerBar} />
        </div>
      </PlayerProvider>
    </div>
  );
}

export default Wrapper;
