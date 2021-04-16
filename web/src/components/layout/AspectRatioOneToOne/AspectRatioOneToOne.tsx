import classNames from 'classnames';
import React, { PropsWithChildren, ReactElement } from 'react';
import styles from './AspectRatioOneToOne.module.scss';

type Props = {
  className?: string;
};

function AspectRatioOneToOne({
  children,
  className,
}: PropsWithChildren<Props>): ReactElement {
  return (
    <div className={classNames(styles.root, className)}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
}

export default AspectRatioOneToOne;
