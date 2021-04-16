import AppLink from 'components/layout/AppLink/AppLink';
import { AuthContext } from 'modules/auth/AuthContext';
import React, { ReactElement, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './LoginInfo.module.scss';

function LoginInfo(): ReactElement | null {
  const history = useHistory();
  const authContext = useContext(AuthContext);

  if (!authContext.user) {
    return null;
  }

  const { user, logout } = authContext;

  return (
    <div className={styles.root}>
      <span className={styles.name}>Hello, {user.displayName}!</span>
      <AppLink
        className={styles.logout}
        to="#"
        underlined
        onClick={async () => {
          await logout();
          history.push('/login');
        }}
      >
        Logout
      </AppLink>
    </div>
  );
}

export default LoginInfo;
