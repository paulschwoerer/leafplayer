import classNames from 'classnames';
import { CloseIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import React, { ReactElement } from 'react';
import styles from './Alert.module.scss';

type Props = {
  message: string;
  onClose?: () => void;
};

function BaseAlert({
  message,
  className,
  onClose,
}: Props & { className?: string }): ReactElement | null {
  if (!message.length) {
    return null;
  }

  return (
    <div className={classNames(styles.root, className)}>
      {message}
      <IconButton onClick={onClose} icon={<CloseIcon />} />
    </div>
  );
}

export function ErrorAlert(props: Props): ReactElement {
  return <BaseAlert {...props} className={styles.error} />;
}

export function SuccessAlert(props: Props): ReactElement {
  return <BaseAlert {...props} className={styles.success} />;
}

export function Alert(props: Props): ReactElement {
  return <BaseAlert {...props} />;
}
