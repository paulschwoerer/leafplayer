<template>
    <div class="route-home">
        <Header>
            <h1>Welcome back, {{user.name}}</h1>
        </Header>

        <ContentWrapper>
            <div class="suggested-albums" v-if="suggestedAlbums.length">
                <h2>
                    Check out these albums
                    <Button variation="white" :onClick="loadSuggestedAlbums">More</Button>
                </h2>
                <Waterfall>
                    <AlbumCard v-for="album in suggestedAlbums" key="album.id" :album="album" />
                </Waterfall>
            </div>

            <div class="popular-songs" v-if="popularSongIds.length">
                <h2>Most popular songs</h2>
                <SongList :songIds="popularSongIds" showArtist showAlbum />
            </div>

            <div class="welcome" v-else>
                <ContentNotification icon="library_music">
                    The collection seems to be empty.

                    <div v-if="isCurrentUserAdmin">
                        <router-link :to="administrationLink">
                            <Button>Administrate Collection</Button>
                        </router-link>
                    </div>
                </ContentNotification>
            </div>
        </ContentWrapper>
    </div>
</template>

<script>
    import Auth from 'auth';
    import { mapActions, mapState } from 'vuex';
    import Button from 'components/form/Button';
    import { getAlbum } from 'utils/mediaUtils';
    import PageNames from 'data/enum/PageNames';
    import Header from 'components/content/Header';
    import SongList from 'components/media/SongList';
    import AlbumCard from 'components/media/AlbumCard';
    import Waterfall from 'components/content/Waterfall';
    import { MediaNamespace } from 'store/modules/media';
    import ContentWrapper from 'components/content/ContentWrapper';
    import ContentNotification from 'components/content/ContentNotification';

    export default {
        name: 'RouteHome',

        created() {
            if (!this.suggestedAlbums.length) {
                this.loadSuggestedAlbums();
            }

            if (!this.popularSongIds.length) {
                this.loadPopularSongs();
            }
        },

        computed: {
            ...mapState(MediaNamespace, {
                suggestedAlbumIds: state => state.suggestedAlbumIds,
                popularSongIds: state => state.popularSongIds,
            }),

            suggestedAlbums() {
                return this.suggestedAlbumIds.map(getAlbum);
            },

            user() {
                return Auth.user();
            },

            isCurrentUserAdmin() {
                return Auth.check('admin');
            },

            administrationLink() {
                return {
                    name: PageNames.ADMINISTRATION_COLLECTION,
                };
            },
        },

        methods: mapActions(MediaNamespace, {
            loadPopularSongs: 'loadPopularSongs',
            loadSuggestedAlbums: 'loadSuggestedAlbums',
        }),

        components: {
            Button,
            Header,
            SongList,
            AlbumCard,
            Waterfall,
            ContentWrapper,
            ContentNotification,
        },
    };
</script>

<style src="./Home.scss" lang="scss"></style>
