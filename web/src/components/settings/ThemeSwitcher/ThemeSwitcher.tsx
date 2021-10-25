import classNames from 'classnames';
import { ButtonText } from 'components/form/Button/Button';
import { EarthIcon, MoonIcon, SunIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import { ThemeContext } from 'modules/theming/ThemeContext';
import React, { ReactElement, useContext } from 'react';
import styles from './ThemeSwitcher.module.scss';

function ThemeSwitcher(): ReactElement {
  const { isNightMode, setIsNightMode } = useContext(ThemeContext);

  return (
    <div className={styles.root}>
      <ButtonText
        className={styles.toggle}
        onClick={() => setIsNightMode(!isNightMode)}
      >
        {isNightMode ? 'Enable day mode' : 'Enable night mode'}
      </ButtonText>
      <div
        className={classNames(styles.solarSystem, {
          [styles.night]: isNightMode,
        })}
      >
        <Icon icon={<EarthIcon />} className={styles.earth} />

        <div className={styles.disk}>
          <Icon icon={<SunIcon />} className={styles.sun} />
          <Icon icon={<MoonIcon />} className={styles.moon} />
        </div>
      </div>
    </div>
  );
}

export default ThemeSwitcher;
