import classNames from 'classnames';
import Icon from 'components/icons/Icon/Icon';
import React, { ReactElement } from 'react';
import styles from './RoundInput.module.scss';

type Props = {
  type: string;
  value: string;
  name: string;
  placeholder?: string;
  icon?: ReactElement;
  onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function RoundInput({
  type,
  name,
  value,
  icon,
  placeholder,
  onChange,
  onBlur,
}: Props): ReactElement {
  return (
    <div className={classNames(styles.root, { [styles.hasIcon]: !!icon })}>
      {icon && <Icon className={styles.icon} icon={icon} />}
      <input
        placeholder={placeholder}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
}

export default RoundInput;
