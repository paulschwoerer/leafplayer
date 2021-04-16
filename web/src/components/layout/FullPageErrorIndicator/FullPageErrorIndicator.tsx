import { ExclamationMarkIcon } from 'components/icons';
import React, { ReactElement } from 'react';
import Icon from '../../icons/Icon/Icon';
import styles from './FullPageErrorIndicator.module.scss';

type Props = {
  message: string;
};

function FullPageErrorIndicator({ message }: Props): ReactElement {
  return (
    <div className={styles.root}>
      <Icon icon={<ExclamationMarkIcon />} size="lg" />
      <b className={styles.message}>{message}</b>
    </div>
  );
}

export default FullPageErrorIndicator;
