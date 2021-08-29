import classNames from 'classnames';
import { ArrowForwardIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import React, { PropsWithChildren, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.scss';

type Props = {
  type?: 'button' | 'reset' | 'submit';
  danger?: boolean;
  disabled?: boolean;
  className?: string;
  to?: string;
  onClick?: (event: React.MouseEvent) => void;
};

export function ButtonPrimary(props: PropsWithChildren<Props>): ReactElement {
  return <Button {...props} variation="primary" />;
}

export function ButtonOutlined(props: PropsWithChildren<Props>): ReactElement {
  return <Button {...props} variation="outlined" />;
}

export function ButtonText(props: PropsWithChildren<Props>): ReactElement {
  return <Button {...props} variation="text" />;
}

function Button({
  type,
  disabled,
  danger,
  variation,
  onClick,
  children,
  to,
  className,
}: PropsWithChildren<
  Props & { variation: 'primary' | 'outlined' | 'text' }
>): ReactElement {
  if (to) {
    return (
      <Link
        to={to}
        className={classNames(styles.root, className, styles[variation], {
          [styles.danger]: danger,
        })}
        onClick={onClick}
      >
        {children}
        <Icon icon={<ArrowForwardIcon />} className={styles.linkIcon}></Icon>
      </Link>
    );
  }

  return (
    <button
      className={classNames(styles.root, className, styles[variation], {
        [styles.danger]: danger,
      })}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
