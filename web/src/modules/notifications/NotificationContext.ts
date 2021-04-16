import { createContext } from 'react';
import { throwNotImplemented } from './../../helpers/context';

export type NotificationType = 'default' | 'error';

export type Notification = {
  title: string;
  message: string;
  type?: NotificationType;
};

type Actions = {
  showNotification: (notification: Notification) => number;
};

export const NotificationContext = createContext<Actions>({
  showNotification: () => {
    throwNotImplemented();
    return 0;
  },
});
