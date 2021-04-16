import React, { PropsWithChildren, ReactElement } from 'react';
import styles from './SectionHeader.module.scss';

type Props = {
  headline: string;
};

function SectionHeader({
  headline,
  children,
}: PropsWithChildren<Props>): ReactElement {
  return (
    <div className={styles.root}>
      <h2>{headline}</h2>
      <div>{children}</div>
    </div>
  );
}

export default SectionHeader;
