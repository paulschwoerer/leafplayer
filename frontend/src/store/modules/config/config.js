import config from '../../../../config';

export default {
    namespaced: true,

    state: {
        api: {
            base: `${process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : '/'}api/`,
        },
    },

    actions: {

    },

    mutations: {

    },

    getters: {

    },
};
