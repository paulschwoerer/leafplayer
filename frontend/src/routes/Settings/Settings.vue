<template>
    <div class="route-settings">
        <CHeader>
            <h1>Settings</h1>
            <p>Change your personal settings, {{user.name}}!</p>
        </CHeader>

        <div class="settings-contents">
            <ChangePassword />
        </div>
    </div>
</template>

<script>
    import Auth from 'auth/index';
    import CHeader from 'components/content/Header';
    import ChangePassword from 'components/settings/ChangePassword';

    export default {
        name: 'RouteSettings',

        computed: {
            user() {
                return Auth.user();
            },
        },

        components: {
            CHeader,
            ChangePassword,
        },
    };
</script>

<style src="./Settings.scss" lang="scss"></style>
