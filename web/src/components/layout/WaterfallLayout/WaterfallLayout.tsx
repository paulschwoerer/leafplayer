import classNames from 'classnames';
import React, { PropsWithChildren, ReactElement } from 'react';
import styles from './WaterfallLayout.module.scss';

type Props = {
  itemSize?: 'sm' | 'md' | 'lg';
};

function WaterfallLayout({
  itemSize = 'sm',
  children,
}: PropsWithChildren<Props>): ReactElement {
  return (
    <div className={classNames(styles.root, styles[itemSize])}>{children}</div>
  );
}

export default WaterfallLayout;
