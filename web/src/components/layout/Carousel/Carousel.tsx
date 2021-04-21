import React, { PropsWithChildren, ReactElement } from 'react';
import styles from './Carousel.module.scss';

function Carousel({ children }: PropsWithChildren<unknown>): ReactElement {
  return (
    <div className={styles.root}>
      <div className={styles.viewport}>
        <div className={styles.track}>{children}</div>
      </div>
    </div>
  );
}

export default Carousel;
