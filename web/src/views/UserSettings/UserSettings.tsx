import SectionHeader from 'components/layout/SectionHeader/SectionHeader';
import ViewHeader from 'components/layout/ViewHeader/ViewHeader';
import PasswordChanging from 'components/settings/PasswordChanging/PasswordChanging';
import ThemeSwitcher from 'components/settings/ThemeSwitcher/ThemeSwitcher';
import UserSessions from 'components/settings/UserSessions/UserSessions';
import React, { ReactElement } from 'react';
import styles from './UserSettings.module.scss';

function UserSettings(): ReactElement {
  return (
    <>
      <ViewHeader headline="Settings" />

      <ThemeSwitcher />

      <div className={styles.container}>
        <section>
          <SectionHeader headline="Change Your Password" />
          <PasswordChanging />
        </section>

        <section>
          <SectionHeader headline="Your Sessions" />
          <UserSessions />
        </section>
      </div>
    </>
  );
}

export default UserSettings;
