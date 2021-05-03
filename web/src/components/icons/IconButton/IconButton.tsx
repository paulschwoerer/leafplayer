import React, { ReactElement } from 'react';
import Icon from '../Icon/Icon';
import styles from './IconButton.module.scss';

type Props = {
  icon: ReactElement;
  onClick?: () => void;
};

function IconButton({ icon, onClick }: Props): ReactElement {
  return (
    <button className={styles.root} onClick={onClick}>
      <Icon icon={icon} />
    </button>
  );
}

export default IconButton;
