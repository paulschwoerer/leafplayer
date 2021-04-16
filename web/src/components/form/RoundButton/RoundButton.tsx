import classNames from 'classnames';
import React, { ReactElement } from 'react';
import Icon from '../../icons/Icon/Icon';
import styles from './RoundButton.module.scss';

type Props = {
  icon: ReactElement;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  withBorder?: boolean;
  primary?: boolean;
};

function RoundButton({
  icon,
  disabled,
  className,
  onClick,
  withBorder,
  primary,
}: Props): ReactElement {
  return (
    <button
      className={classNames(styles.root, className, {
        [styles.withBorder]: withBorder,
        [styles.primary]: primary,
      })}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon icon={icon} size="md" />
    </button>
  );
}

export default RoundButton;
