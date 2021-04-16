import classNames from 'classnames';
import React, { PropsWithChildren, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styles from './InvisibleLink.module.scss';

type Props = {
  to: string;
  className?: string;
};

function InvisibleLink({
  to,
  className,
  children,
}: PropsWithChildren<Props>): ReactElement {
  return (
    <Link className={classNames(styles.root, className)} to={to}>
      {children}
    </Link>
  );
}

export default InvisibleLink;
