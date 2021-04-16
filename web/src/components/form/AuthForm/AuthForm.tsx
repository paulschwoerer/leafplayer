import { CloseIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import React, { PropsWithChildren, ReactElement, ReactNode } from 'react';
import Logo from '../../layout/Logo/Logo';
import styles from './AuthForm.module.scss';

type Props = {
  actions?: ReactNode;
  error?: string;
  onCloseError?: () => void;
  onSubmit?: () => void;
};

function AuthForm({
  error,
  children,
  actions,
  onCloseError,
  onSubmit,
}: PropsWithChildren<Props>): ReactElement {
  return (
    <div className={styles.root}>
      <Logo />
      <form className={styles.form} onSubmit={onSubmit}>
        {!!error && (
          <div className={styles.error}>
            {error}
            <Icon
              icon={<CloseIcon />}
              className={styles.closeBtn}
              onClick={onCloseError}
            />
          </div>
        )}
        {children}
        <div className={styles.actions}>{actions}</div>
      </form>
    </div>
  );
}

export default AuthForm;
