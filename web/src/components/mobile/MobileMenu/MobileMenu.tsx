import classNames from 'classnames';
import Icon from 'components/icons/Icon/Icon';
import FloatingMenuButton from 'components/mobile/FloatingMenuButton/FloatingMenuButton';
import { PlayerContext } from 'modules/player/context';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './MobileMenu.module.scss';

type NavEntry = {
  label: string;
  to: string;
  icon: ReactElement;
};

type Props = {
  className?: string;
  nav: NavEntry[];
};

function MobileMenu({ className, nav }: Props): ReactElement {
  const [{ current }] = useContext(PlayerContext);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isExpanded]);

  return (
    <div className={classNames(styles.root, className)}>
      <FloatingMenuButton
        shifted={!!current}
        showCloseIcon={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      />

      <div
        className={classNames(styles.menu, {
          [styles.isVisible]: isExpanded,
          [styles.shifted]: !!current,
        })}
        onClick={() => setIsExpanded(false)}
      >
        {nav.map(({ to, label, icon }, i) => (
          <Link
            key={label}
            className={styles.navItem}
            to={to}
            style={{ transitionDelay: `${100 + (nav.length - i) * 30}ms` }}
          >
            {label}
            <span className={styles.iconWrapper}>
              <Icon icon={icon} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MobileMenu;
