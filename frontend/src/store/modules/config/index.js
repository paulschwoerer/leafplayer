import config, { SET_SETUP } from './config';

export const ConfigNamespace = 'config';

export const ConfigMutationTypes = {
    SET_SETUP: `${ConfigNamespace}/${SET_SETUP}`,
};

export default config;
