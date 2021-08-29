import { ButtonPrimary, ButtonText } from 'components/form/Button/Button';
import Icon from 'components/icons/Icon/Icon';
import Input from 'components/form/Input/Input';
import If from 'components/If';
import ApiLoader from 'components/layout/ApiLoader';
import Modal from 'components/modals/Modal/Modal';
import { dateFromUnixTimestamp } from 'helpers/time';
import { UserSession, UserSessionsResponseDto } from 'leafplayer-common';
import { isApiError, makeApiDeleteRequest } from 'modules/api';
import { NotificationContext } from 'modules/notifications/NotificationContext';
import React, { ReactElement, useContext, useState } from 'react';
import styles from './UserSessions.module.scss';
import { ComputerIcon } from 'components/icons';

type SessionProps = {
  isCurrent: boolean;
  session: UserSession;
  onRevokeSession?: () => void;
};

function Session({
  isCurrent,
  session,
  onRevokeSession,
}: SessionProps): ReactElement {
  return (
    <div className={styles.card}>
      <Icon icon={<ComputerIcon />} className={styles.icon} />
      <div className={styles.details}>
        {isCurrent ? (
          <p>Your current session</p>
        ) : (
          <p>
            {session.browser} on {session.os} <br />
            <small>
              <span>Last accessed on </span>
              {new Intl.DateTimeFormat().format(
                dateFromUnixTimestamp(session.lastUsedAt),
              )}
            </small>
          </p>
        )}
      </div>
      <If condition={!isCurrent}>
        <ButtonText danger onClick={onRevokeSession}>
          Revoke session
        </ButtonText>
      </If>
    </div>
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
  const [password, setPassword] = useState('');

  const { showNotification } = useContext(NotificationContext);

  async function revokeSession() {
    closeModal();

    const response = await makeApiDeleteRequest(`sessions/${sessionToRevoke}`, {
      password,
    });

    if (isApiError(response)) {
      showNotification({
        title: 'Failed to revoke session',
        message: response.error,
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
    setPassword('');
  }

  return (
    <div className={styles.root}>
      <ApiLoader<UserSessionsResponseDto>
        slug="sessions"
        renderContent={({ sessions, currentSessionId }, reloadSessions) => (
          <>
            {sessions
              .sort((a, b) => sessionSort(a, b, currentSessionId))
              .map(session => (
                <Session
                  key={session.id}
                  isCurrent={session.id === currentSessionId}
                  session={session}
                  onRevokeSession={() => setSessionToRevoke(session.id)}
                />
              ))}

            <small>
              If you notice anything suspicious in this list, please inform the
              administrator of your server
            </small>

            <Modal isVisible={sessionToRevoke !== null} hideModal={closeModal}>
              <p>Please enter your password to proceed</p>

              <Input
                label="Password"
                name="password"
                type="password"
                value={password}
                onInput={ev => setPassword(ev.currentTarget.value)}
              />

              <ButtonPrimary
                onClick={() => revokeSession().then(reloadSessions)}
              >
                Revoke Session
              </ButtonPrimary>
              <ButtonText onClick={closeModal}>Cancel</ButtonText>
            </Modal>
          </>
        )}
      />
    </div>
  );
}

export default UserSessions;
