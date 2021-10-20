import { CloseIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import React, {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';

type UseModalState = {
  isVisible: boolean;
  toggleModal: () => void;
};

export function useModal(): UseModalState {
  const [isVisible, setIsVisible] = useState(false);

  function toggleModal() {
    setIsVisible(!isVisible);
  }

  return {
    isVisible,
    toggleModal,
  };
}

type Props = {
  isVisible: boolean;
  title: string;
  hideModal: () => void;
};

function Modal({
  isVisible,
  children,
  ...props
}: PropsWithChildren<Props>): ReactElement | null {
  if (!isVisible) {
    return null;
  }

  return <ActualModal {...props}>{children}</ActualModal>;
}

function ActualModal({
  title,
  hideModal,
  children,
}: Omit<PropsWithChildren<Props>, 'isVisible'>): ReactElement {
  const elRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let previousFocus: Element | null;

    if (elRef.current) {
      previousFocus = document.activeElement;
      elRef.current.focus();
    }

    return () => {
      if (previousFocus && previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, []);

  function handleKeyUp(ev: React.KeyboardEvent) {
    if (ev.key === 'Escape') {
      hideModal();
    }
  }

  function handleBackgroundClick(ev: React.MouseEvent) {
    if (ev.target === ev.currentTarget) {
      hideModal();
    }
  }

  return createPortal(
    <div
      className={styles.wrapper}
      onClick={handleBackgroundClick}
      onKeyUp={handleKeyUp}
    >
      <section
        className={styles.modal}
        role="dialog"
        ref={elRef}
        tabIndex={0}
        aria-labelledby="modal-title"
      >
        <div className={styles.header}>
          <h1 id="modal-title">{title}</h1>
          <IconButton
            icon={<CloseIcon />}
            onClick={hideModal}
            ariaLabel="close"
          />
        </div>
        <div className={styles.content}>{children}</div>
      </section>
    </div>,
    document.body,
  );
}

export default Modal;
