/* global APP_BASE_URL */

import Vue from 'vue';
import Auth from 'auth';
import VueRouter from 'vue-router';
import routes from 'routes';
import { sync } from 'vuex-router-sync';
import VueDnD from 'dnd/index';
import store from 'store';
import { setValue } from 'utils/injector';
import { ADAPTER } from 'data/Injectables';
import Adapter from 'store/adapter';
import 'normalize.css';

import App from './App';

setValue(ADAPTER, new Adapter());

Vue.config.productionTip = false;

Vue.use(VueRouter);

Vue.use(VueDnD, { store });

const router = new VueRouter({
    hashbang: false,
    mode: 'history',
    linkActiveClass: 'active',
    base: APP_BASE_URL,
    routes,
    scrollBehavior: (to, from, savedPosition) =>
        (!savedPosition ? { x: 0, y: 0 } : savedPosition),
});

sync(store, router);

Vue.use(Auth, {
    store,
    router,
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App),
});
