import classNames from 'classnames';
import { CloseIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import React, { PropsWithChildren, ReactElement, useState } from 'react';
import { NotificationContext, Notification } from './NotificationContext';
import styles from './NotificationProvider.module.scss';

const DEFAULT_NOTIFICATION_DURATION = 4000;

export function NotificationProvider({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  const [notifications, setNotifications] = useState<
    (Notification & { id: number })[]
  >([]);

  function showNotification(notification: Notification): number {
    const id = Date.now();

    setNotifications(notifications => [
      ...notifications,
      {
        ...notification,
        id,
      },
    ]);

    setTimeout(() => removeNotification(id), DEFAULT_NOTIFICATION_DURATION);

    return id;
  }

  function removeNotification(id: number): void {
    setNotifications(notifications => notifications.filter(n => n.id !== id));
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className={styles.root}>
        {notifications.map(n => (
          <div
            key={n.id}
            className={classNames(
              styles.notification,
              n.type && n.type !== 'default' && styles[n.type],
            )}
            onClick={() => removeNotification(n.id)}
          >
            <b className={styles.title}>{n.title}</b>
            <p className={styles.message}>{n.message}</p>
            <Icon icon={<CloseIcon />} className={styles.close} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
