<template>
    <div class="route-collection">
        <CHeader>
            <h1>Collection</h1>
            <p>This is the complete media collection.</p>

            <HeaderInfo v-if="statistics !== null">
                <HeaderInfoItem icon="playlist_play" :value="String(statistics.playlistCount)" />
                <HeaderInfoItem icon="album" :value="String(statistics.albumCount)" />
                <HeaderInfoItem icon="person" :value="String(statistics.artistCount)" />
                <HeaderInfoItem icon="music_note" :value="String(statistics.songCount)" />
            </HeaderInfo>
        </CHeader>
        <HeaderMenu :items="menuItems" />

        <ContentWrapper>
            <router-view />
        </ContentWrapper>
    </div>
</template>

<script>
    import PageNames from 'data/enum/PageNames';
    import { mapState, mapActions } from 'vuex';
    import CHeader from 'components/content/Header';
    import { MediaNamespace } from 'store/modules/media';
    import HeaderMenu from 'components/content/HeaderMenu';
    import HeaderInfo from 'components/content/HeaderInfo';
    import HeaderInfoItem from 'components/content/HeaderInfoItem';
    import ContentWrapper from 'components/content/ContentWrapper';

    export default {
        name: 'RouteCollection',

        data() {
            return {
                menuItems: [
                    { route: PageNames.COLLECTION_ARTISTS, label: 'Artists' },
                    { route: PageNames.COLLECTION_ALBUMS, label: 'Albums' },
                    { route: PageNames.COLLECTION_PLAYLISTS, label: 'Playlists' },
                ],
                transitionName: 'slide-left',
            };
        },

        mounted() {
            this.loadStatistics();
        },

        computed: mapState(MediaNamespace, {
            statistics: 'statistics',
        }),

        methods: mapActions(MediaNamespace, {
            loadStatistics: 'loadStatistics',
        }),

        components: {
            CHeader,
            HeaderMenu,
            HeaderInfo,
            HeaderInfoItem,
            ContentWrapper,
        },
    };
</script>

<style src="./Collection.scss" lang="scss"></style>
