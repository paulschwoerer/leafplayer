import classNames from 'classnames';
import React, { ReactElement } from 'react';
import styles from './Spacer.module.scss';

type Props = {
  size?: 'sm' | 'md' | 'lg';
};

function Spacer({ size = 'md' }: Props): ReactElement {
  return <div className={classNames(styles.root, styles[size])} />;
}

export default Spacer;
