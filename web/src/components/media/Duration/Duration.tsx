import { durationToString } from 'helpers/time';
import React, { ReactElement } from 'react';
import styles from './Duration.module.scss';

type Props = {
  seconds: number | null;
};

function Duration({ seconds }: Props): ReactElement {
  if (seconds === null) {
    return <span className={styles.root}>--:--</span>;
  }

  return <span className={styles.root}>{durationToString(seconds)}</span>;
}

export default Duration;
