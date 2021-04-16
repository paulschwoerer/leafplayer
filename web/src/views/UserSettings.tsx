import SectionHeader from 'components/layout/SectionHeader/SectionHeader';
import ViewHeader from 'components/layout/ViewHeader/ViewHeader';
import UserSessions from 'components/settings/UserSessions/UserSessions';
import React, { ReactElement } from 'react';

function UserSettings(): ReactElement {
  return (
    <>
      <ViewHeader headline="Settings" />

      <SectionHeader headline="Your Sessions" />

      <UserSessions />
    </>
  );
}

export default UserSettings;
