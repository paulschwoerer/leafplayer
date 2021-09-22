import React, { PropsWithChildren, ReactElement } from 'react';
import styles from './FilterSearchWrapper.module.scss';

function FilterSearchWrapper({
  children,
}: PropsWithChildren<unknown>): ReactElement {
  return <div className={styles.root}>{children}</div>;
}

export default FilterSearchWrapper;
