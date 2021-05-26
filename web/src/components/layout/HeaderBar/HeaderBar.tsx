import RoundInput from 'components/form/RoundInput/RoundInput';
import HistoryNavigation from 'components/HistoryNavigation/HistoryNavigation';
import { SearchIcon } from 'components/icons';
import React, { ReactElement } from 'react';
import { useSearchQuery } from 'views/Search';
import styles from './HeaderBar.module.scss';

function HeaderBar(): ReactElement {
  const [searchQuery, setSearchQuery] = useSearchQuery();

  return (
    <div className={styles.root}>
      <HistoryNavigation />
      <RoundInput
        placeholder="Search Library"
        icon={<SearchIcon />}
        name="search"
        type="text"
        value={searchQuery}
        onChange={ev => setSearchQuery(ev.target.value)}
      />
    </div>
  );
}

export default HeaderBar;
