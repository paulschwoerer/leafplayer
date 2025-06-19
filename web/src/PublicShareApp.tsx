import { NotificationProvider } from 'modules/notifications/NotificationProvider';
import { PlayerProvider } from 'modules/player/PlayerProvider';
import { ThemeProvider } from 'modules/theming/ThemeProvider';
import React from 'react';
import PublicShareContainer from 'components/sharing/PublicShareContainer/PublicShareContainer';

function PublicShareApp() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <PlayerProvider>
          <PublicShareContainer />
        </PlayerProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default PublicShareApp;
