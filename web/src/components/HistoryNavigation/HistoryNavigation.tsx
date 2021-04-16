import { ChevronLeftIcon } from 'components/icons';
import Icon from 'components/icons/Icon/Icon';
import React, { ReactElement } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './HistoryNavigation.module.scss';

function HistoryNavigation(): ReactElement {
  const history = useHistory();

  return (
    <div className={styles.root}>
      <span className={styles.back} onClick={() => history.goBack()}>
        <Icon icon={<ChevronLeftIcon />} />
        back
      </span>
    </div>
  );
}

export default HistoryNavigation;
