<template>
    <div class="route-administration">
        <CHeader>
            <h1>Administration</h1>
            <p>Administrate your Leafplayer server from here.</p>
        </CHeader>
        <HeaderMenu :items="menuItems"></HeaderMenu>

        <ContentWrapper>
            <router-view />
        </ContentWrapper>
    </div>
</template>

<script>
    import CHeader from 'components/content/Header';
    import HeaderMenu from 'components/content/HeaderMenu';
    import ContentWrapper from 'components/content/ContentWrapper';

    export default {
        name: 'RouteAdministration',

        data() {
            return {
                menuItems: [
                    { route: 'administration.collection', label: 'Collection' },
                    { route: 'administration.users', label: 'Users' },
                ],
            };
        },

        components: {
            CHeader,
            HeaderMenu,
            ContentWrapper,
        },
    };
</script>

<style src="./Administration.scss" lang="scss"></style>
