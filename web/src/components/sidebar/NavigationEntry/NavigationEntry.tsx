import classNames from 'classnames';
import Icon from 'components/icons/Icon/Icon';
import React, { type ReactElement } from 'react';
import { NavLink } from 'react-router';
import styles from './NavigationEntry.module.scss';

type Props = {
  to: string;
  label: string;
  icon: ReactElement;
  end?: boolean;
};

function NavEntry({ to, icon, label, end }: Props): ReactElement {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? classNames(styles.navEntry, styles.active) : styles.navEntry
      }
      end={end || false}
    >
      <Icon icon={icon} className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </NavLink>
  );
}

export default NavEntry;
