import { CloseIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import React, { PropsWithChildren, ReactElement, useState } from 'react';
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
  hideModal: () => void;
};

function Modal({
  isVisible,
  hideModal,
  children,
}: PropsWithChildren<Props>): ReactElement | null {
  if (!isVisible) {
    return null;
  }

  return createPortal(
    <div className={styles.root} onClick={hideModal}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        {children}
        <div className={styles.close}>
          <IconButton icon={<CloseIcon />} onClick={hideModal} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
