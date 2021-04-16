import React, { ReactElement } from 'react';
import styles from './IconButton.module.scss';

type Props = {
  icon: ReactElement;
  onClick?: (ev: React.MouseEvent) => void;
};

function IconButton({ icon, onClick }: Props): ReactElement {
  return (
    <button className={styles.toggleButton} onClick={onClick}>
      {icon}
    </button>
  );
}

export default IconButton;
