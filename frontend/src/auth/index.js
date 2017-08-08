import Vue from 'vue';
import axios from 'axios';
import { getValue } from 'utils/injector';
import { ADAPTER } from 'data/Injectables';
import PageNames from 'data/enum/PageNames';
import ModelType from 'data/enum/ModelType';

/* eslint-disable dot-notation */

export default {
    /**
     * Install method to register plugin with VueJS.
     *
     * @param vueInstance
     * @param router
     * @param store
     */
    install(vueInstance, {
        router,
        store,
    }) {
        axios.interceptors.request.use((config) => {
            const { token } = this.store.state.auth;

            const hasAuthHeader = !!config['Authorization'];

            if (token && !hasAuthHeader) {
                this.setAuthHeader(config);
            }

            return config;
        });

        axios.interceptors.response.use(
             response => this.handleResponse(response),
             error => (this.isInvalidToken(error) ? this.refreshToken(error) : Promise.reject(error)),
        );

        router.beforeEach((to, from, next) => {
            const { auth } = store.state;

            if (auth.ready === false || (auth.userId === null && from.name === PageNames.LOGIN)) {
                store.dispatch('auth/fetchUser').then(() => {
                    this.routeCheckAuth(to, from, next);
                });
            } else {
                this.routeCheckAuth(to, from, next);
            }
        });

        this.store = store;
        this.router = router;

        Vue.prototype.$auth = this;
        Vue.auth = this;

        // Refresh token every 5 minutes
        setInterval(() => {
            if (this.check()) {
                this.refresh();
            }
        }, 1000 * 60 * 5);
    },

    /**
     * Perform login.
     *
     * @param credentials
     * @param redirect
     * @returns {Promise}
     */
    login(credentials, redirect) {
        return new Promise((resolve, reject) => {
            getValue(ADAPTER).post('auth/authenticate', credentials).then((response) => {
                this.storeToken(response.data.token);
                this.router.push(redirect || '/');
                resolve();
            }).catch(reject);
        });
    },

    /**
     * Logout the user from the application.
     *
     * @param redirect
     */
    performLocalLogout(redirect) {
        this.store.dispatch('clearStore');
        this.router.push(redirect || `/${PageNames.LOGIN}`);
    },

    /**
     * Perform logout.
     *
     * @returns {Promise}
     */
    logout(redirect) {
        return getValue(ADAPTER).post('auth/logout')
            .then(() => this.performLocalLogout(redirect))
            .catch(() => this.performLocalLogout(redirect));
    },

    /**
     * Try to refresh the session.
     */
    refresh() {
        return this.refreshToken({});
    },

    /**
     * Get the currently authenticated user.
     *
     * @returns {*|null}
     */
    user() {
        const { model, auth } = this.store.state;

        return model[ModelType.USER][auth.userId] || null;
    },

    /**
     * Check if the currently authenticated user has a specific role.
     *
     * @param role
     * @returns {boolean}
     */
    check(role) {
        const user = this.user();
        const { ready } = this.store.state.auth;

        if (ready === false || user === null) {
            return false;
        }

        if (typeof role === 'string') {
            const { roles } = user;

            if (roles) {
                return roles.findIndex(r => r.name === role) !== -1;
            }

            return false;
        }

        return true;
    },

    /**
     * Refresh the current token and then retry the request.
     *
     * @param error
     * @returns {Promise}
     */
    refreshToken(error) {
        const { config } = error;

        return new Promise((resolve, reject) => {
            getValue(ADAPTER).post('auth/refresh').then((response) => {
                this.storeToken(response.data.token);

                return (config ? this.retryRequest(config) : Promise.resolve()).then(resolve);
            }).catch((err) => {
                this.store.commit('auth/SET_TO_READY'); // set to ready because we know about the user state
                this.performLocalLogout();
                reject(err);
            });
        });
    },

    /**
     * Interceptor to handle a server response.
     *
     * @param response
     * @returns {*}
     */
    handleResponse(response) {
        if (response && response.headers && response.headers) {
            const { headers } = response;
            const header = headers.Authorization || headers.authorization;

            if (header) {
                this.storeToken(header.replace('Bearer ', ''));
            }
        }

        return response;
    },

    /**
     * Retry a request.
     *
     * @param config
     * @returns {AxiosPromise}
     */
    retryRequest(config) {
        this.setAuthHeader(config);

        return axios(config);
    },

    /**
     * Set the Authorization header on an outgoing request.
     *
     * @param config
     */
    setAuthHeader(config) {
        const { token } = this.store.state.auth;

        config.headers['Authorization'] = `Bearer ${token}`;
    },

    /**
     * Store a token in the store.
     *
     * @param token
     */
    storeToken(token) {
        this.store.commit('auth/STORE_TOKEN', token);
    },

    /**
     * Check if the response is caused by an invalid i.e. outdated token.
     *
     * @param error
     * @returns {boolean}
     */
    isInvalidToken(error) {
        const { response } = error;

        if (response && response.data) {
            const { code } = response.data;

            return response.status === 401 &&
                (
                    code === 'auth.token_expired' ||
                    code === 'auth.invalid_token_provided' ||
                    code === 'auth.unauthorized'
                );
        }

        return false;
    },

    /**
     * Route guard.
     *
     * @param to
     * @param from
     * @param next
     */
    routeCheckAuth(to, from, next) {
        let auth;

        if (to.matched.length) {
            for (let i = 0; i < to.matched.length; i += 1) {
                const item = to.matched[i];

                if (typeof item.meta !== 'undefined' && typeof item.meta.auth !== 'undefined') {
                    auth = item.meta.auth;
                }
            }
        }

        if (auth && (auth === true || typeof auth === 'string')) {
            if (this.check() === false) {
                next(`/${PageNames.LOGIN}`);
            } else if (typeof auth === 'string' && !this.check(auth)) {
                next(`/${PageNames.FORBIDDEN}`);
            } else {
                next();
            }
        } else if (auth === false && this.check()) {
            next('/');
        } else {
            next();
        }
    },
};
