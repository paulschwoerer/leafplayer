import React, { ReactElement } from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from './AppearFromBottom.module.scss';

type Props = {
  in: boolean;
  nodeRef: React.MutableRefObject<HTMLElement | null>;
  children: ReactElement;
};

function AppearFromBottom({
  in: inProp,
  nodeRef,
  children,
}: Props): ReactElement {
  return (
    <CSSTransition
      classNames={{
        ...styles,
      }}
      unmountOnExit
      in={inProp}
      timeout={300}
      nodeRef={nodeRef}
    >
      {children}
    </CSSTransition>
  );
}

export default AppearFromBottom;
