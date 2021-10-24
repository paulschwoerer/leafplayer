import classNames from 'classnames';
import { ChevronLeftIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import React, { ReactElement, useRef, useState } from 'react';
import styles from './Select.module.scss';

type Option = {
  value: string;
  label: string;
};

type Props = {
  value: Option;
  options: Option[];
  onChange?: (option: Option) => void;
};

function Select({ value, options, onChange }: Props): ReactElement {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(options.indexOf(value));
  const ref = useRef<HTMLButtonElement>(null);

  function selectOption(option: Option) {
    onChange && onChange(option);
    setSelectedIndex(options.indexOf(option));
    setCollapsed(true);
  }

  function handleKeyPress(ev: React.KeyboardEvent) {
    ev.stopPropagation();

    switch (ev.key) {
      case 'Enter':
        if (collapsed) {
          setCollapsed(false);
        } else {
          selectOption(options[selectedIndex]);
        }
        ev.preventDefault();
        break;
      case 'ArrowDown':
        if (!collapsed) {
          setSelectedIndex(
            selectedIndex < options.length - 1 ? selectedIndex + 1 : 0,
          );
          ev.preventDefault();
        }
        break;
      case 'ArrowUp':
        if (!collapsed) {
          setSelectedIndex(
            selectedIndex > 0 ? selectedIndex - 1 : options.length - 1,
          );
          ev.preventDefault();
        }
        break;
      case 'Escape':
        setCollapsed(true);
        ev.preventDefault();
    }
  }

  return (
    <button
      className={classNames(styles.root, {
        [styles.collapsed]: collapsed,
      })}
      onClick={() => setCollapsed(!collapsed)}
      ref={ref}
      aria-haspopup="listbox"
      aria-expanded={!collapsed}
      onKeyDown={handleKeyPress}
      onBlur={() => setCollapsed(true)}
    >
      <span className={styles.current} title={value.label}>
        {value.label}
      </span>
      <span className={styles.arrow}>
        <Icon icon={<ChevronLeftIcon />} />
      </span>
      <ul className={styles.options} role="listbox">
        {options.map((option, i) => (
          <li
            className={classNames(styles.option, {
              [styles.selected]: i === selectedIndex,
              [styles.active]: value.value === option.value,
            })}
            key={option.value}
            onClick={() => selectOption(option)}
            aria-selected={i === selectedIndex}
            title={option.label}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </button>
  );
}

export default Select;
