import React, { PropsWithChildren, ReactElement } from 'react';
import InvisibleLink from '../InvisibleLink/InvisibleLink';
import styles from './Card.module.scss';

type Props = {
  linkTo?: string;
};

function Card({ linkTo, children }: PropsWithChildren<Props>): ReactElement {
  if (linkTo) {
    return (
      <InvisibleLink className={styles.root} to={linkTo}>
        {children}
      </InvisibleLink>
    );
  }

  return <div className={styles.root}>{children}</div>;
}

export default Card;
