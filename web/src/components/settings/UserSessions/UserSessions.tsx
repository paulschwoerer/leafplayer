import { ButtonText } from 'components/form/Button/Button';
import { ComputerIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import ApiLoader from 'components/layout/ApiLoader';
import Card from 'components/layout/Card/Card';
import { dateFromUnixTimestamp } from 'helpers/time';
import { UserSession, UserSessionsResponseDto } from 'leafplayer-common';
import { isApiError, makeApiDeleteRequest } from 'modules/api';
import { AuthContext } from 'modules/auth';
import { NotificationContext } from 'modules/notifications/NotificationContext';
import React, { ReactElement, ReactNode, useContext } from 'react';
import styles from './UserSessions.module.scss';

type BaseSessionProps = {
  details: ReactNode;
  action: ReactNode;
};

type SessionProps = {
  session: UserSession;
  onRevoke?: () => void;
};

type CurrentSessionProps = {
  onLogout?: () => void;
};

function BaseSession({ action, details }: BaseSessionProps) {
  return (
    <Card>
      <section className={styles.session}>
        <Icon icon={<ComputerIcon />} className={styles.icon} />
        <div className={styles.details}>{details}</div>
        {action}
      </section>
    </Card>
  );
}

function CurrentSession({ onLogout }: CurrentSessionProps) {
  return (
    <BaseSession
      details={<p>Your current session</p>}
      action={
        <ButtonText danger onClick={onLogout}>
          Logout
        </ButtonText>
      }
    />
  );
}

function Session({ session, onRevoke }: SessionProps): ReactElement {
  return (
    <BaseSession
      details={
        <p>
          {session.browser} on {session.os} <br />
          <small>
            Last accessed on{' '}
            {new Intl.DateTimeFormat().format(
              dateFromUnixTimestamp(session.lastUsedAt),
            )}
          </small>
        </p>
      }
      action={
        <ButtonText danger onClick={onRevoke}>
          Revoke session
        </ButtonText>
      }
    />
  );
}

function sessionSort(a: UserSession, b: UserSession, currentSessionId: string) {
  if (a.id === currentSessionId) {
    return -1;
  }

  if (b.id === currentSessionId) {
    return 1;
  }

  return b.lastUsedAt - a.lastUsedAt;
}

function UserSessions(): ReactElement {
  const { logout } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  async function revokeSession(sessionId: string) {
    const response = await makeApiDeleteRequest(`auth/sessions/${sessionId}`);

    if (isApiError(response)) {
      showNotification({
        title: 'Failed to revoke session',
        message: response.message,
        type: 'error',
      });
    } else {
      showNotification({
        title: 'Session revoked',
        message: 'The session was successfully revoked',
      });
    }
  }

  return (
    <ApiLoader<UserSessionsResponseDto>
      slug="auth/sessions"
      renderContent={({ sessions, currentSessionId }, { reload }) => {
        const sorted = sessions.sort((a, b) =>
          sessionSort(a, b, currentSessionId),
        );

        return (
          <>
            <CurrentSession onLogout={logout} />
            {sorted.slice(1).map(session => (
              <Session
                key={session.id}
                session={session}
                onRevoke={() => revokeSession(session.id).then(reload)}
              />
            ))}

            <small>
              If you notice anything suspicious in this list, please inform the
              administrator of your server
            </small>
          </>
        );
      }}
    />
  );
}

export default UserSessions;
