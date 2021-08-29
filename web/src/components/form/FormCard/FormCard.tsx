import { CloseIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import React, { PropsWithChildren, ReactElement, ReactNode } from 'react';
import Logo from '../../layout/Logo/Logo';
import styles from './FormCard.module.scss';

type Props = {
  actions?: ReactNode;
  error?: string;
  onCloseError?: () => void;
  onSubmit?: () => void;
};

function FormCard({
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
            <IconButton onClick={onCloseError} icon={<CloseIcon />} />
          </div>
        )}
        {children}
        <div className={styles.actions}>{actions}</div>
      </form>
    </div>
  );
}

export default FormCard;
