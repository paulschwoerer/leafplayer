import { OptionsIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import AppearFromBottom from 'components/transitions/AppearFromBottom/AppearFromBottom';
import { useMediaQuery } from 'helpers/mediaQuery';
import React, {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import { Link } from 'react-router-dom';
import styles from './OptionsDropdown.module.scss';

type Props = {
  align?: 'left' | 'right';
};

type OptionProps = {
  onClick?: () => void;
  to?: string;
};

type DesktopOptionsProps = {
  isVisible: boolean;
  referenceRef: React.MutableRefObject<HTMLElement | null>;
  align?: 'left' | 'right';
};

function DesktopOptionsDropdown({
  isVisible,
  align,
  referenceRef,
  children,
}: PropsWithChildren<DesktopOptionsProps>): ReactElement | null {
  const popperRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const { styles: popperStyles, attributes, update } = usePopper(
    referenceRef.current,
    popperRef.current,
    {
      modifiers: [
        { name: 'offset', options: { offset: [0, 10] } },
        { name: 'arrow', options: { element: arrowRef.current } },
      ],
      placement: align,
      strategy: 'absolute',
    },
  );

  useEffect(() => {
    if (!popperRef.current) {
      return;
    }

    if (isVisible) {
      popperRef.current.setAttribute('data-show', '');

      if (update) {
        update().catch(e => console.error('could not update popper: ', e));
      }
    } else {
      popperRef.current.removeAttribute('data-show');
    }
  }, [isVisible, update]);

  return (
    <div
      className={styles.desktopWrapper}
      ref={popperRef}
      style={popperStyles.popper}
      {...attributes.popper}
    >
      <div className={styles.arrow} ref={arrowRef} style={popperStyles.arrow} />
      {children}
    </div>
  );
}

type MobileOptionsProps = {
  isVisible: boolean;
};

function MobileOptionsDropdown({
  isVisible,
  children,
}: PropsWithChildren<MobileOptionsProps>): ReactElement {
  const nodeRef = useRef(null);

  return createPortal(
    <AppearFromBottom nodeRef={nodeRef} in={isVisible}>
      <div ref={nodeRef} className={styles.mobileWrapper}>
        {children}
      </div>
    </AppearFromBottom>,
    document.getElementById('popper-container') || document.body,
  );
}

function OptionsDropdown({
  align = 'right',
  children,
}: PropsWithChildren<Props>): ReactElement {
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        ref={buttonRef}
      />
      {isMobile ? (
        <MobileOptionsDropdown isVisible={isVisible}>
          <div className={styles.options} onClick={() => setIsVisible(false)}>
            {children}
          </div>
        </MobileOptionsDropdown>
      ) : (
        <DesktopOptionsDropdown
          isVisible={isVisible}
          referenceRef={buttonRef}
          align={align}
        >
          <div className={styles.options} onClick={() => setIsVisible(false)}>
            {children}
          </div>
        </DesktopOptionsDropdown>
      )}
    </div>
  );
}

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
    <div className={styles.option} onClick={onClick}>
      {children}
    </div>
  );
}

OptionsDropdown.Option = Option;

export default OptionsDropdown;
