import classNames from 'classnames';
import NavigationEntry from 'components/sidebar/NavigationEntry/NavigationEntry';
import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../layout/Logo/Logo';
import LoginInfo from '../LoginInfo/LoginInfo';
import styles from './DesktopSidebar.module.scss';

type NavEntry = {
  label: string;
  to: string;
  icon: ReactElement;
  exact?: boolean;
};

type Props = {
  nav: NavEntry[];
  className?: string;
  onClick?: () => void;
};

function Sidebar({ nav, className, onClick }: Props): ReactElement {
  return (
    <div className={classNames(styles.root, className)} onClick={onClick}>
      <Link to="/">
        <Logo />
      </Link>
      <nav>
        {nav.map(entry => (
          <NavigationEntry
            key={entry.to}
            to={entry.to}
            label={entry.label}
            icon={entry.icon}
            exact={entry.exact}
          />
        ))}
      </nav>
      <LoginInfo />
    </div>
  );
}

export default Sidebar;
