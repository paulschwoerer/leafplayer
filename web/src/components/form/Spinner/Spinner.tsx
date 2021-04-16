import classNames from 'classnames';
import React, { ReactElement } from 'react';
import styles from './Spinner.module.scss';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  invertColors?: boolean;
};

function Spinner({ size = 'md', invertColors }: Props): ReactElement {
  return (
    <div
      className={classNames(styles.root, styles[size], {
        [styles.invertColors]: invertColors,
      })}
    >
      <svg>
        <circle cx="50%" cy="50%" r="33.33%"></circle>
      </svg>
    </div>
  );
}

export default Spinner;
