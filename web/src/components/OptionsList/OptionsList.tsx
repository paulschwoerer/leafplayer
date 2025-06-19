import React, { PropsWithChildren, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styles from './OptionsList.module.scss';

function OptionsList({ children }: PropsWithChildren<unknown>): ReactElement {
  return <div className={styles.options}>{children}</div>;
}

type OptionProps = {
  onClick?: () => void;
  to?: string;
};

function Option({
  to,
  onClick,
  children,
}: PropsWithChildren<OptionProps>): ReactElement {
  if (to) {
    return (
      <Link to={to} className={styles.option} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles.option} onClick={onClick}>
      {children}
    </button>
  );
}

OptionsList.Option = Option;

export default OptionsList;
