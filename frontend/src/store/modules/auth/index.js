import auth, {
    SET_USER,
    STORE_TOKEN,
    SET_TO_READY,
} from './auth';

export const AuthNamespace = 'auth';

export const AuthMutationTypes = {
    SET_USER: `${AuthNamespace}/${SET_USER}`,
    STORE_TOKEN: `${AuthNamespace}/${STORE_TOKEN}`,
    SET_TO_READY: `${AuthNamespace}/${SET_TO_READY}`,
};

export default auth;
