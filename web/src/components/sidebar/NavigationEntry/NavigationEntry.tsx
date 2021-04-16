import Icon from 'components/icons/Icon/Icon';
import React, { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './NavigationEntry.module.scss';

type Props = {
  to: string;
  label: string;
  icon: ReactElement;
  exact?: boolean;
};

function NavEntry({ to, icon, label, exact }: Props): ReactElement {
  return (
    <NavLink
      to={to}
      className={styles.navEntry}
      activeClassName={styles.active}
      exact={exact || false}
    >
      <Icon icon={icon} className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </NavLink>
  );
}

export default NavEntry;
