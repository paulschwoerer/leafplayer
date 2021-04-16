import classNames from 'classnames';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import styles from './LazyImage.module.scss';

type Props = {
  fallback?: string;
  url: string;
  className?: string;
};

function LazyImage({ url, fallback, className }: Props): ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const preloader = new Image();
    preloader.onload = () => setIsLoaded(true);

    const intersectionObserver = new IntersectionObserver(
      ([entry], observer) => {
        if (entry && entry.isIntersecting) {
          preloader.src = url;

          observer.disconnect();
        }
      },
    );
    intersectionObserver.observe(elementRef.current);

    return () => {
      preloader.onload = null;
      intersectionObserver.disconnect();
    };
  }, [url]);

  return (
    <div className={classNames(styles.root, className)} ref={elementRef}>
      <div
        className={classNames(styles.image, { [styles.visible]: isLoaded })}
        style={isLoaded ? { backgroundImage: `url(${url})` } : {}}
      />
      {fallback && (
        <div
          className={classNames(styles.image, { [styles.visible]: !isLoaded })}
          style={{ backgroundImage: `url(${fallback})` }}
        />
      )}
    </div>
  );
}

export default LazyImage;
