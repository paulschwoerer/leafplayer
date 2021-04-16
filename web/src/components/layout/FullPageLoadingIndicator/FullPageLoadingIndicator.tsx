import React, { ReactElement } from 'react';
import Spinner from '../../form/Spinner/Spinner';
import styles from './FullPageLoadingIndicator.module.scss';

type Props = {
  invertColors?: boolean;
};

function FullPageLoadingIndicator({ invertColors }: Props): ReactElement {
  return (
    <div className={styles.root}>
      <Spinner size="lg" invertColors={invertColors} />
    </div>
  );
}

export default FullPageLoadingIndicator;
