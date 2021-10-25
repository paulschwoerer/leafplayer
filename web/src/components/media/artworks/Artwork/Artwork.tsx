import classNames from 'classnames';
import React, { ReactElement } from 'react';
import LazyImage from '../../LazyImage/LazyImage';
import styles from './Artwork.module.scss';

type Props = {
  url: string;
  fallbackUrl?: string;
  isRounded?: boolean;
  overlay?: ReactElement;
};

function Artwork({
  overlay,
  url,
  fallbackUrl,
  isRounded,
}: Props): ReactElement {
  return (
    <div
      className={classNames(styles.root, {
        [styles.isRounded]: isRounded,
      })}
    >
      <LazyImage className={styles.image} url={url} fallbackUrl={fallbackUrl} />

      {overlay}
    </div>
  );
}

export default Artwork;
