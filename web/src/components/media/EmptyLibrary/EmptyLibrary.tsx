import React, { ReactElement } from 'react';
import styles from './EmptyLibrary.module.scss';

function EmptyLibrary(): ReactElement {
  return (
    <div className={styles.root}>
      <div className={styles.icon} />

      <p className={styles.text}>The library is currently empty</p>
    </div>
  );
}

export default EmptyLibrary;
