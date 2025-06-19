import DesktopPlayerBar from 'components/player/DesktopPlayerBar/DesktopPlayerBar';
import MobilePlayer from 'components/player/MobilePlayer/MobilePlayer';
import MobilePlayerBar from 'components/player/MobilePlayerBar/MobilePlayerBar';
import { AlbumWithSongsResponseDto } from 'leafplayer-common';
import React, { useState } from 'react';
import SharedAlbum from '../SharedAlbum/SharedAlbum';
import styles from './PublicShareContainer.module.scss';

function PublicShareContainer() {
  const [isMobilePlayerExpanded, setIsMobilePlayerExpanded] = useState(false);

  // TODO: load dynamically
  const shareType = 'album';
  const data: AlbumWithSongsResponseDto = {
    album: {
      id: '666a969e-ba94-4b30-87ef-2a5412dc6bfa',
      artist: {
        id: 'lulu',
        name: 'The Artist',
      },
      name: 'The Album',
      createdAt: '',
      updatedAt: '',
      year: 2000,
    },
    songs: [
      {
        album: {
          id: '666a969e-ba94-4b30-87ef-2a5412dc6bfa',
          name: 'The Album',
        },
        artist: {
          id: 'lulu',
          name: 'The Artist',
        },
        id: 'lele',
        track: 1,
        disk: 1,
        title: 'The Song',
        duration: 120,
        createdAt: '',
        updatedAt: '',
      },
    ],
  };

  // TODO: load dynamically
  const artworkToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODE4NjE5OTcsImlhdCI6MTc1MDMyNTk5N30.XAPCSBZXQMJIfmnIjhIzbEYvKa8vfBUyCnc1_qh4fXU';

  function renderSharedItem() {
    switch (shareType) {
      case 'album':
        return (
          <SharedAlbum
            album={data.album}
            songs={data.songs}
            artworkToken={artworkToken}
          />
        );
      default:
        throw new Error(`unknown shareType ${shareType}`);
    }
  }

  return (
    <div className={styles.root}>
      <MobilePlayerBar
        className={styles.mobilePlayerBar}
        onClick={() => setIsMobilePlayerExpanded(true)}
      />
      {isMobilePlayerExpanded && (
        <MobilePlayer
          disableLinks
          onClose={() => setIsMobilePlayerExpanded(false)}
        />
      )}

      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.content}>{renderSharedItem()}</div>
        </main>
        <DesktopPlayerBar className={styles.desktopPlayerBar} disableLinks />
      </div>
    </div>
  );
}

export default PublicShareContainer;
