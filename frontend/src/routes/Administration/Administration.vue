<template>
    <div class="route-administration">
        <Header>
            <h1>Administration</h1>
            <p>Administrate your Leafplayer server from here.</p>
        </Header>
        <HeaderMenu :items="menuItems" />

        <ContentWrapper>
            <router-view />
        </ContentWrapper>
    </div>
</template>

<script>
    import Header from 'components/content/Header';
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
            Header,
            HeaderMenu,
            ContentWrapper,
        },
    };
</script>

<style src="./Administration.scss" lang="scss"></style>
