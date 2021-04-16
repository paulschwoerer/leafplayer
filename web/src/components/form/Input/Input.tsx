import classNames from 'classnames';
import { ExclamationMarkIcon } from 'components/icons';
import React, { ChangeEvent, ReactElement, useState } from 'react';
import Icon from '../../icons/Icon/Icon';
import styles from './Input.module.scss';

type Props = {
  type: 'text' | 'email' | 'password' | 'search';
  label: string;
  value: string;
  name: string;
  variation?: 'dark' | 'light';
  error?: string | false;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

function Input({
  error,
  type,
  label,
  name,
  onBlur,
  onChange,
  value,
  className,
}: Props): ReactElement {
  const [isFocused, setIsFocused] = useState(false);

  function handleBlur(event: ChangeEvent<HTMLInputElement>) {
    setIsFocused(false);

    if (onBlur) {
      onBlur(event);
    }
  }

  return (
    <div
      className={classNames(styles.root, className, {
        [styles.hasError]: !!error,
        [styles.hasValue]: !!value,
        [styles.isFocused]: isFocused,
      })}
    >
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>

      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
      />

      {error && (
        <Icon
          icon={<ExclamationMarkIcon />}
          size="sm"
          className={styles.icon}
        />
      )}

      <span className={styles.line} />

      <span className={styles.error}>{error}</span>
    </div>
  );
}

export default Input;
