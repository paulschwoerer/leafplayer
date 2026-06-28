import classNames from 'classnames';
import React, { type ReactElement, useRef, useState } from 'react';
import styles from './LazyImage.module.scss';

type Props = {
  fallbackUrl?: string;
  url: string;
  className?: string;
};

function LazyImage({ url, fallbackUrl, className }: Props): ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);

  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={classNames(styles.root, className)}
      ref={elementRef}
      style={fallbackUrl ? { backgroundImage: `url(${fallbackUrl})` } : {}}
    >
      <img
        className={classNames(styles.image, { [styles.visible]: isLoaded })}
        alt=""
        src={url}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

export default LazyImage;
