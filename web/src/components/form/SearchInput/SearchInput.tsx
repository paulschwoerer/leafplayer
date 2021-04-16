import { SearchIcon } from 'components/icons';
import React, { ReactElement } from 'react';
import Icon from '../../icons/Icon/Icon';
import styles from './SearchInput.module.scss';

type Props = {
  placeholder: string;
  value: string;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
};

function SearchInput({
  value,
  autoFocus,
  placeholder,
  onChange,
}: Props): ReactElement {
  return (
    <div className={styles.root}>
      <Icon icon={<SearchIcon />} />
      <input
        type="search"
        className={styles.input}
        value={value}
        autoFocus={autoFocus}
        onChange={ev => onChange && onChange(ev.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default SearchInput;
