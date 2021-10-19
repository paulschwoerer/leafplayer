import { ErrorAlert } from 'components/Alert/Alert';
import React, { PropsWithChildren, ReactElement, ReactNode } from 'react';
import Logo from '../../layout/Logo/Logo';
import styles from './FormCard.module.scss';

type Props = {
  actions?: ReactNode;
  error: string;
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
        <ErrorAlert message={error} onClose={onCloseError} />
        {children}
        <div className={styles.actions}>{actions}</div>
      </form>
    </div>
  );
}

export default FormCard;
