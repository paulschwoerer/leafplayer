import { OptionsIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import AppearFromBottom from 'components/transitions/AppearFromBottom/AppearFromBottom';
import { useMediaQuery } from 'helpers/mediaQuery';
import React, {
  type PropsWithChildren,
  type ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  useFloating,
  autoUpdate,
  offset,
  shift,
  flip,
  hide,
  arrow,
} from '@floating-ui/react-dom';
import { Link } from 'react-router';

import styles from './OptionsPopover.module.scss';

type PopoverProps = {
  align?: 'left' | 'right';
};

type DesktopPopoverProps = {
  isVisible: boolean;
  referenceRef: HTMLElement | null;
  align?: 'left' | 'right';
};

function DesktopPopover({
  isVisible,
  align,
  referenceRef,
  children,
}: PropsWithChildren<DesktopPopoverProps>): ReactElement | null {
  // intentional useState(), as  the ref is used during render()
  const [floatingRef, setFloatingRef] = useState<HTMLDivElement | null>(null);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const { floatingStyles, middlewareData, placement } = useFloating({
    elements: {
      reference: referenceRef,
      floating: floatingRef,
    },
    middleware: [
      offset({ mainAxis: 10 }),
      shift(),
      flip(),
      arrow({
        element: arrowRef,
        padding: 20, // keep arrow inside bounds defined by rounded corners
      }),
      hide({ strategy: 'referenceHidden' }),
    ],
    open: isVisible,
    whileElementsMounted: autoUpdate,
    placement: align,
  });

  return isVisible ? (
    <div
      className={styles.desktopWrapper}
      ref={setFloatingRef}
      style={{
        visibility: middlewareData.hide?.referenceHidden ? 'hidden' : 'visible',
        ...floatingStyles,
      }}
    >
      <div
        className={styles.arrow}
        ref={setArrowRef}
        style={{
          position: 'absolute',
          top: middlewareData.arrow?.y,
          right: placement === 'left' ? 0 : undefined,
          left: placement === 'right' ? 0 : undefined,
        }}
      />
      <div className={styles.desktopWrapperInner}>{children}</div>
    </div>
  ) : null;
}

type MobilePopoverProps = {
  isVisible: boolean;
};

function MobilePopover({
  isVisible,
  children,
}: PropsWithChildren<MobilePopoverProps>): ReactElement {
  const nodeRef = useRef(null);

  return createPortal(
    <AppearFromBottom nodeRef={nodeRef} in={isVisible}>
      <div ref={nodeRef} className={styles.mobileWrapper}>
        {children}
      </div>
    </AppearFromBottom>,
    document.getElementById('popover-container') || document.body,
  );
}

function OptionsPopover({
  align = 'right',
  children,
}: PropsWithChildren<PopoverProps>): ReactElement {
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // intentional useState(), as  the ref is used during render()
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const isMobile = useMediaQuery('(max-width: 700px)');

  useEffect(() => {
    function onDocumentClick(ev: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      if (
        !ev.target ||
        !(ev.target instanceof Element) ||
        !rootRef.current.contains(ev.target)
      ) {
        setIsVisible(false);
      }
    }

    if (isVisible) {
      document.addEventListener('click', onDocumentClick);
    }

    return () => document.removeEventListener('click', onDocumentClick);
  }, [isVisible]);

  return (
    <div className={styles.root} ref={rootRef}>
      <IconButton
        icon={<OptionsIcon />}
        onClick={() => setIsVisible(!isVisible)}
        ref={setButtonRef}
      />
      {isMobile ? (
        <MobilePopover isVisible={isVisible}>
          <div className={styles.options} onClick={() => setIsVisible(false)}>
            {children}
          </div>
        </MobilePopover>
      ) : (
        <DesktopPopover
          isVisible={isVisible}
          referenceRef={buttonRef}
          align={align}
        >
          <div className={styles.options} onClick={() => setIsVisible(false)}>
            {children}
          </div>
        </DesktopPopover>
      )}
    </div>
  );
}

type OptionProps = {
  onClick?: () => void;
  to?: string;
};

function Option({
  to,
  onClick,
  children,
}: PropsWithChildren<OptionProps>): ReactElement {
  if (to) {
    return (
      <Link to={to} className={styles.option} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={styles.option} onClick={onClick}>
      {children}
    </button>
  );
}

OptionsPopover.Option = Option;

export default OptionsPopover;
