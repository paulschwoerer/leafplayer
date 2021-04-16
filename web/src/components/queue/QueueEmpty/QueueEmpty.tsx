import React, { ReactElement } from 'react';
import styles from './QueueEmpty.module.scss';

function QueueEmpty(): ReactElement {
  return (
    <div className={styles.root}>
      <h2>Nothing here</h2>
      <p>Your queue is currently empty.</p>
    </div>
  );
}

export default QueueEmpty;
