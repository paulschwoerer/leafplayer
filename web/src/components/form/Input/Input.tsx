import classNames from 'classnames';
import React, { ChangeEvent, ReactElement, useEffect, useRef } from 'react';
import styles from './Input.module.scss';

type Props = {
  type?: 'text' | 'email' | 'password' | 'search';
  label?: string;
  value: string;
  name: string;
  icon?: ReactElement;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  error?: string | false;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  onInput?: React.FormEventHandler<HTMLInputElement>;
};

function Input({
  type = 'text',
  label,
  value,
  name,
  icon,
  placeholder,
  autoComplete,
  autoFocus,
  error,
  onBlur,
  onInput,
}: Props): ReactElement {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  return (
    <div
      className={classNames(styles.root, {
        [styles.hasError]: !!error,
        [styles.hasValue]: !!value,
        [styles.hasLabel]: !!label,
        [styles.hasIcon]: !!icon,
      })}
    >
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        placeholder={placeholder || label}
        autoComplete={autoComplete}
        onInput={onInput}
        onBlur={onBlur}
        ref={ref}
        aria-describedby={`${name}-error`}
      />

      {icon && <span className={styles.icon}>{icon}</span>}

      {label && <label htmlFor={name}>{label}</label>}

      <div className={styles.errorContainer}>
        <span id={`${name}-error`} className={styles.error}>
          {error}
        </span>
      </div>
    </div>
  );
}

export default Input;
