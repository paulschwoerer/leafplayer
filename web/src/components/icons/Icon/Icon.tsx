import classNames from 'classnames';
import React, { ReactElement } from 'react';
import styles from './Icon.module.scss';

type Props = {
  icon: ReactElement;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (ev: React.MouseEvent) => void;
  mirrored?: boolean;
};

function Icon({
  icon,
  size = 'md',
  mirrored,
  className,
  onClick,
}: Props): ReactElement {
  return (
    <span
      className={classNames(styles.root, styles[size], className, {
        [styles.mirrored]: mirrored,
      })}
      onClick={onClick}
    >
      {icon}
    </span>
  );
}

export default Icon;
