<template>
    <div class="component-app">
        <transition name="fade">
            <div v-if="authReady && !needsSetup">
                <SideBarContainer v-if="authenticated" />
                <div id="content" :class="{ shifted: authenticated }">
                    <router-view class="view" />
                </div>
                <ScrollTopButton />
                <ModalRoot v-if="authenticated" />
            </div>
        </transition>

        <transition name="fade">
            <div v-if="needsSetup">
                <SetupAdminAccount />
            </div>
        </transition>
    </div>
</template>

<script>
    import Auth from 'auth/index';
    import { mapState, mapActions } from 'vuex';
    import Spinner from 'components/Spinner';
    import ModalRoot from 'components/modal/ModalRoot';
    import ScrollTopButton from 'components/ScrollTopButton';
    import SetupAdminAccount from 'components/SetupAdminAccount';
    import SideBarContainer from 'components/sidebar/SideBarContainer';

    export default {
        name: 'ComponentApp',

        computed: {
            ...mapState({
                authReady: state => state.auth.ready,
                needsSetup: state => state.config.needsSetup,
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
            SetupAdminAccount,
        },
    };
</script>

<style src="./App.scss" lang="scss"></style>

<style src="../assets/sass/app.scss" lang="scss"></style>
