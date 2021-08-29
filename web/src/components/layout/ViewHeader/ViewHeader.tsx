import React, { ReactElement } from 'react';
import styles from './ViewHeader.module.scss';

type Props = {
  headline: string;
};

function ViewHeader({ headline }: Props): ReactElement {
  return <h1 className={styles.root}>{headline}</h1>;
}

export default ViewHeader;
