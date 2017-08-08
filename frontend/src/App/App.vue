<template>
    <div class="component-app">
        <transition name="fade">
            <div v-if="authReady">
                <SideBarContainer v-if="authenticated" />
                <div id="content" :class="{ shifted: authenticated }">
                    <router-view class="view" />
                </div>
                <ScrollTopButton />
                <ModalRoot v-if="authenticated" />
            </div>
        </transition>
    </div>
</template>

<script>
    import Auth from 'auth/index';
    import { mapState } from 'vuex';
    import Spinner from 'components/Spinner';
    import ModalRoot from 'components/modal/ModalRoot';
    import ScrollTopButton from 'components/ScrollTopButton';
    import SideBarContainer from 'components/sidebar/SideBarContainer';

    export default {
        name: 'ComponentApp',

        computed: {
            ...mapState('auth', {
                authReady: state => state.ready,
            }),

            authenticated() {
                return Auth.check();
            },
        },

        components: {
            Spinner,
            ModalRoot,
            ScrollTopButton,
            SideBarContainer,
        },
    };
</script>

<style src="./App.scss" lang="scss"></style>

<style src="../assets/sass/app.scss" lang="scss"></style>
