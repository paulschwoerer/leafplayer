import classNames from 'classnames';
import React, { type PropsWithChildren, type ReactElement } from 'react';
import { Link } from 'react-router';
import styles from './AppLink.module.scss';

type Props = {
  className?: string;
  to: string;
  title?: string;
  underlined?: boolean;
  onClick?: (ev: React.MouseEvent) => void;
};

function AppLink({
  className,
  to,
  title,
  onClick,
  underlined,
  children,
}: PropsWithChildren<Props>): ReactElement {
  return (
    <Link
      to={to}
      className={classNames(styles.root, className, {
        [styles.underlined]: underlined,
      })}
      title={title}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export default AppLink;
