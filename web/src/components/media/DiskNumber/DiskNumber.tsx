import { AlbumIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import React, { ReactElement } from 'react';
import styles from './DiskNumber.module.scss';

type Props = {
  disk: number;
};

export default function DiskNumber({ disk }: Props): ReactElement {
  return (
    <div className={styles.root}>
      <Icon icon={<AlbumIcon />} className={styles.icon} />
      <span className={styles.disk}>{disk}</span>
    </div>
  );
}
