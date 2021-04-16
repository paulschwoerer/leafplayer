import React, { ReactElement } from 'react';
import logo from 'assets/leafplayer-logo.svg';
import styles from './Logo.module.scss';

function Logo(): ReactElement {
  return (
    <div className={styles.root}>
      <img src={logo} alt="Leafplayer logo" />
    </div>
  );
}

export default Logo;
