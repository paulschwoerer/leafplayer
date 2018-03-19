<template>
    <div class="component-side-bar-container" :class="{ visible: sideBarVisible }">
        <div class="logo-container">
            <router-link :to="homeLink">
                <img src="../../../assets/svg/leafplayer-logo.svg" alt="Leafplayer Logo">
                <h1 class="name">Leafplayer</h1>
            </router-link>
        </div>

        <transition name="fade">
            <div class="close-button" @click.prevent="toggleSideBar">
                <Icon name="close" />
            </div>
        </transition>

        <div class="search-container">
            <SearchInput variation="light" />
        </div>

        <div class="nav-container">
            <nav>
                <ul>
                    <li><router-link :to="navigationLinks.favorites">Favorites</router-link></li>
                    <li><router-link :to="navigationLinks.collection">Collection</router-link></li>
                </ul>
            </nav>
        </div>
        <div class="seperator seperator-light" />

        <SideBarPlaylistContainer />

        <div class="seperator seperator-light" />

        <div class="credits" v-if="isDemo">
            Credit for all demo music goes to <a href="http://www.purple-planet.com">purple-planet.com</a>
        </div>

        <div class="user-container">
            <p>Welcome back, <b>{{user.name}}</b></p>

            <div class="actions">
                <router-link :to="navigationLinks.settings" title="Settings"><Icon name="settings" /></router-link>
                <router-link v-if="isAdmin" :to="navigationLinks.administration" title="Administration"><Icon name="dashboard" /></router-link>
                <a href="#" @click="logout" title="Logout"><Icon name="exit_to_app" /></a>
            </div>
        </div>

        <Player />
    </div>
</template>

<script>
    import Auth from 'auth';
    import Logo from 'components/Logo';
    import Icon from 'components/content/Icon';
    import { mapState, mapActions } from 'vuex';
    import Button from 'components/form/Button';
    import PageNames from 'data/enum/PageNames';
    import { isDemo } from 'utils/demoUtils';
    import Player from 'components/sidebar/Player';
    import SearchInput from 'components/search/SearchInput';
    import SideBarPlaylistContainer from 'components/sidebar/SideBarPlaylistContainer';

    export default {
        name: 'ComponentSideBar',

        computed: {
            ...mapState({
                sideBarVisible: state => state.sideBarVisible,
            }),

            /**
             * Sidebar navigation links.
             *
             * @returns object
             */
            navigationLinks() {
                return {
                    favorites: { name: PageNames.FAVORITES },
                    collection: { name: PageNames.COLLECTION },
                    settings: { name: PageNames.SETTINGS },
                    administration: { name: PageNames.ADMINISTRATION },
                };
            },

            /**
             * Check if the current user is an admin.
             *
             * @returns bool
             */
            isAdmin() {
                return Auth.check('admin');
            },

            /**
             * Get the currently authenticated user.
             *
             * @returns object
             */
            user() {
                return Auth.user();
            },

            /**
             * Get the link to the home route.
             *
             * @returns object
             */
            homeLink() {
                return {
                    name: PageNames.HOME,
                };
            },

            isDemo() {
                return isDemo();
            },
        },

        watch: {
            sideBarVisible(value) {
                if (value) {
                    document.body.classList.add('side-bar-shown');
                } else {
                    document.body.classList.remove('side-bar-shown');
                }
            },
        },

        methods: {
            ...mapActions({
                toggleSideBar: 'toggleSideBar',
            }),

            /**
             * Trigger the logout of the current user.
             */
            logout() {
                Auth.logout();
            },
        },

        components: {
            Icon,
            Logo,
            Player,
            Button,
            SearchInput,
            SideBarPlaylistContainer,
        },
    };
</script>

<style src="./SideBarContainer.scss" lang="scss"></style>
