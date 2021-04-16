import classNames from 'classnames';
import RoundButton from 'components/form/RoundButton/RoundButton';
import { CloseIcon, MenuIcon } from 'components/icons';
import React, { ReactElement } from 'react';
import styles from './FloatingMenuButton.module.scss';

type Props = {
  showCloseIcon: boolean;
  onClick?: () => void;
  className?: string;
  shifted?: boolean;
};

function FloatingMenuButton({
  showCloseIcon,
  onClick,
  shifted,
  className,
}: Props): ReactElement {
  return (
    <RoundButton
      className={classNames(styles.root, className, {
        [styles.showCloseIcon]: showCloseIcon,
        [styles.shifted]: shifted,
      })}
      icon={showCloseIcon ? <CloseIcon /> : <MenuIcon />}
      onClick={onClick}
    />
  );
}

export default FloatingMenuButton;
