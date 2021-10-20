import { PlayerPersistor, PlayerPersistState } from './PlayerPersistor';

const LOCAL_STORAGE_KEY = 'lp_player_state';

export class LocalStoragePlayerPersistor implements PlayerPersistor {
  clear(): Promise<void> {
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    return Promise.resolve();
  }

  persist(state: PlayerPersistState): Promise<void> {
    const content = JSON.stringify(state);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, content);

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  retrieve(): Promise<PlayerPersistState | null> {
    try {
      const content = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (content === null) {
        return Promise.resolve(null);
      }

      const state = JSON.parse(content) as PlayerPersistState;

      return Promise.resolve(state);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
