import classNames from 'classnames';
import React, { ReactElement } from 'react';
import styles from './TextPlaceholder.module.scss';

type Props = {
  thickness?: number;
  length?: number;
  className?: string;
};

function TextPlaceholder({
  thickness = 4,
  length = 100,
  className,
}: Props): ReactElement {
  return (
    <span
      className={classNames(styles.root, className)}
      style={{ width: `${length}px`, height: `${thickness}px` }}
    />
  );
}

export default TextPlaceholder;
