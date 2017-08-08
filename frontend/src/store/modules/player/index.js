import player, {
    SET_MODE,
    SET_QUEUE,
    SET_CURRENT_SONG_ID,
    SET_PLAYBACK_HISTORY,
    SET_CURRENT_QUEUE_INDEX,
} from './player';

export const PlayerNamespace = 'player';

export const PlayerMutationTypes = {
    SET_MODE: `${PlayerNamespace}/${SET_MODE}`,
    SET_QUEUE: `${PlayerNamespace}/${SET_QUEUE}`,
    SET_CURRENT_SONG_ID: `${PlayerNamespace}/${SET_CURRENT_SONG_ID}`,
    SET_PLAYBACK_HISTORY: `${PlayerNamespace}/${SET_PLAYBACK_HISTORY}`,
    SET_CURRENT_QUEUE_INDEX: `${PlayerNamespace}/${SET_CURRENT_QUEUE_INDEX}`,
};

export default player;
