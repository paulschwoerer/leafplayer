import React, { ReactElement, ReactNode } from 'react';
import styles from './ViewHeader.module.scss';

type Props = {
  headline: string;
  content?: ReactNode;
};

function ViewHeader({ headline, content }: Props): ReactElement {
  return (
    <div className={styles.root}>
      <h1>{headline}</h1>
      <div>{content}</div>
    </div>
  );
}

export default ViewHeader;
