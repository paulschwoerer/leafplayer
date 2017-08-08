<template>
    <div class="route-album">
        <template v-if="album">
            <AlbumHeader :album="album" />

            <ContentWrapper>
                <div class="album-details">
                    <div class="info">
                        <p>Here, some abum info fetched from popular services will be shown soon.</p>
                    </div>
                    <div class="actions">
                        <Button :onClick="handlePlayNext">Play next</Button>
                        <Button :onClick="handleEnqueue">Enqueue</Button>
                    </div>
                    <div class="art">
                        <AlbumArt :album="album" />
                    </div>
                </div>

                <SongList :key="albumId" :songIds="album.songIds" showArtist showTrackNumber />
            </ContentWrapper>
        </template>

        <NotFound v-else>
            This album does not exist.
        </NotFound>
    </div>
</template>

<script>
    import store from 'store';
    import { mapState } from 'vuex';
    import Params from 'data/enum/Params';
    import EventBus from 'store/eventbus';
    import Icon from 'components/content/Icon';
    import { getAlbum } from 'utils/mediaUtils';
    import Button from 'components/form/Button';
    import AlbumArt from 'components/media/AlbumArt';
    import SongList from 'components/media/SongList';
    import NotFound from 'components/content/NotFound';
    import { MediaNamespace } from 'store/modules/media';
    import AlbumHeader from 'components/media/AlbumHeader';
    import ContentWrapper from 'components/content/ContentWrapper';

    /**
     * Handle a route change in the application i.e. handle loading the album from the backend.
     *
     * @param to
     * @param next
     */
    const handleRouteChange = (to, next) => {
        const { [Params.ALBUM_ID]: id } = to.params;

        store.dispatch(`${MediaNamespace}/loadAlbum`, id).then(next).catch(next);
    };

    export default {
        name: 'RouteAlbum',

        beforeRouteEnter(to, from, next) {
            handleRouteChange(to, next);
        },

        beforeRouteUpdate(to, from, next) {
            handleRouteChange(to, next);
        },

        computed: {
            ...mapState('route', {
                albumId: state => state.params[Params.ALBUM_ID],
            }),

            /**
             * Get the album data from the store.
             *
             * @returns object
             */
            album() {
                return getAlbum(this.albumId);
            },
        },

        methods: {
            handlePlayNext() {
                EventBus.$emit('player:playNext', { songIds: this.album.songIds });
            },

            handleEnqueue() {
                EventBus.$emit('player:addSongs', { songIds: this.album.songIds });
            },
        },

        components: {
            Icon,
            Button,
            AlbumArt,
            NotFound,
            SongList,
            AlbumHeader,
            ContentWrapper,
        },
    };
</script>

<style src="./Album.scss" lang="scss"></style>
