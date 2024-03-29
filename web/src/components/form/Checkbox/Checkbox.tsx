import classNames from 'classnames';
import { CheckBoxCheckedIcon, CheckBoxUncheckedIcon } from 'components/icons';
import React, { PropsWithChildren, ReactElement, useState } from 'react';
import Icon from '../../icons/Icon/Icon';
import styles from './Checkbox.module.scss';

type Props = {
  name: string;
  checked: boolean;
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
};

function Checkbox({
  name,
  checked,
  onChange,
  children,
}: PropsWithChildren<Props>): ReactElement {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={classNames(styles.root, {
        [styles.focus]: focused,
      })}
    >
      <label>
        <input
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        <Icon
          className={styles.icon}
          icon={checked ? <CheckBoxCheckedIcon /> : <CheckBoxUncheckedIcon />}
        />

        <span>{children}</span>
      </label>
    </div>
  );
}

export default Checkbox;
