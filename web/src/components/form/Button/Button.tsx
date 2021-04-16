import classNames from 'classnames';
import React, { PropsWithChildren, ReactElement } from 'react';
import styles from './Button.module.scss';

type Props = {
  type?: 'button' | 'reset' | 'submit';
  danger?: boolean;
  disabled?: boolean;
  className?: string;
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
  className,
}: PropsWithChildren<
  Props & { variation: 'primary' | 'outlined' | 'text' }
>): ReactElement {
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
