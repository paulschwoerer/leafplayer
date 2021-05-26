import { ChevronLeftIcon } from 'components/icons';
import IconButton from 'components/icons/IconButton/IconButton';
import React, { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './HistoryNavigation.module.scss';

function HistoryNavigation(): ReactElement {
  const history = useHistory();
  const disabled = history.length === 1;

  return (
    <div className={styles.root}>
      <IconButton
        disabled={disabled}
        icon={<ChevronLeftIcon />}
        onClick={() => history.goBack()}
      />
      <IconButton
        disabled={disabled}
        icon={<ChevronLeftIcon />}
        mirrored
        onClick={() => history.goForward()}
      />
    </div>
  );
}

export default HistoryNavigation;
