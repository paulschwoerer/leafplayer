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
    <button className={styles.root} disabled={disabled} onClick={onClick}>
      <Icon icon={icon} mirrored={mirrored} />
    </button>
  );
}

export default IconButton;
