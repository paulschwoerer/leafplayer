import React, { ReactElement } from 'react';
import Icon from '../Icon/Icon';
import styles from './IconButton.module.scss';

type Props = {
  ariaLabel?: string;
  icon: ReactElement;
  mirrored?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

const IconButton = React.forwardRef<HTMLButtonElement, Props>(
  (
    { ariaLabel, icon, mirrored, disabled, onClick }: Props,
    ref,
  ): ReactElement => {
    return (
      <button
        className={styles.root}
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        ref={ref}
      >
        <Icon icon={icon} mirrored={mirrored} />
      </button>
    );
  },
);

export default IconButton;
