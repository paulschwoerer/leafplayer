import classNames from 'classnames';
import React, { ReactElement } from 'react';
import Icon from '../Icon/Icon';
import styles from './IconButton.module.scss';

type Props = {
  icon: ReactElement;
  mirrored?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

function IconButton({
  icon,
  mirrored,
  disabled,
  onClick,
}: Props): ReactElement {
  return (
    <button
      className={classNames(styles.root, { [styles.mirrored]: mirrored })}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon icon={icon} />
    </button>
  );
}

export default IconButton;
