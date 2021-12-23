import { ButtonPrimary, ButtonText } from 'components/form/Button/Button';
import Input from 'components/form/Input/Input';
import { ComputerIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import ApiLoader from 'components/layout/ApiLoader';
import Modal from 'components/modals/Modal/Modal';
import { dateFromUnixTimestamp } from 'helpers/time';
import {
  RevokeSessionRequestDto,
  UserSession,
  UserSessionsResponseDto,
} from 'leafplayer-common';
import { isApiError, makeApiDeleteRequest } from 'modules/api';
import { AuthContext } from 'modules/auth';
import { NotificationContext } from 'modules/notifications/NotificationContext';
import React, { ReactElement, ReactNode, useContext, useState } from 'react';
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
    <div className={styles.card}>
      <Icon icon={<ComputerIcon />} className={styles.icon} />
      <div className={styles.details}>{details}</div>
      {action}
    </div>
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
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');

  const { logout } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);

  async function revokeSession() {
    closeModal();

    const response = await makeApiDeleteRequest<RevokeSessionRequestDto>(
      `auth/sessions/${sessionToRevoke}`,
      {
        currentPassword,
      },
    );

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

  function closeModal(): void {
    setSessionToRevoke(null);
    setCurrentPassword('');
  }

  return (
    <div className={styles.root}>
      <ApiLoader<UserSessionsResponseDto>
        slug="auth/sessions"
        renderContent={({ sessions, currentSessionId }, reloadSessions) => {
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
                  onRevoke={() => setSessionToRevoke(session.id)}
                />
              ))}

              <small>
                If you notice anything suspicious in this list, please inform
                the administrator of your server
              </small>

              <Modal
                isVisible={sessionToRevoke !== null}
                title="Revoking Session"
                hideModal={closeModal}
              >
                <form
                  onSubmit={() => revokeSession().then(reloadSessions)}
                  className={styles.revokeForm}
                >
                  <b>Enter your password to proceed</b>

                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={currentPassword}
                    onInput={ev => setCurrentPassword(ev.currentTarget.value)}
                  />

                  <ButtonPrimary type="submit">Revoke</ButtonPrimary>
                  <ButtonText onClick={closeModal}>Cancel</ButtonText>
                </form>
              </Modal>
            </>
          );
        }}
      />
    </div>
  );
}

export default UserSessions;
