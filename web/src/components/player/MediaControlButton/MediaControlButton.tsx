import classNames from 'classnames';
import Icon from 'components/icons/Icon/Icon';
import React, { ReactElement } from 'react';
import styles from './MediaControlButton.module.scss';

type Props = {
  icon: ReactElement;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  small?: boolean;
  active?: boolean;
};

function MediaControlButton({
  disabled,
  icon,
  onClick,
  small,
  active,
}: Props): ReactElement {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames(styles.root, {
        [styles.small]: small,
        [styles.active]: active,
      })}
    >
      <Icon className={styles.icon} icon={icon} />
    </button>
  );
}

export default MediaControlButton;
