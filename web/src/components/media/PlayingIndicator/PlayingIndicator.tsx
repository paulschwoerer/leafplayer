import classNames from 'classnames';
import React, { ReactElement } from 'react';
import styles from './PlayingIndicator.module.scss';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

function PlayingIndicator({ size = 'sm', className }: Props): ReactElement {
  return (
    <div className={classNames(styles.root, styles[size], className)}>
      <div className={styles.bars}>
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </div>
    </div>
  );
}

export default PlayingIndicator;
