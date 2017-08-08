<template>
    <div class="route-playlist">
        <template v-if="playlist">
            <PlaylistHeader :playlist="playlist" />

            <ContentWrapper>
                <div class="playlist-songs" v-if="playlist.songCount">
                    <SongList
                        :key="playlistId"
                        :songIds="playlist.songIds"
                        showIndex
                        showAlbum
                        showArtist
                        allowSongSorting
                        :showTrackNumber="false"
                        :onSongDropped="handleSongMove"
                        isPlaylist
                        :onRemoveFromPlaylist="handlePlaylistRemove"
                    />
                </div>

                <div class="empty-playlist" v-else>
                    <ContentNotification icon="playlist_add">
                        There are no songs in this playlist, yet.
                    </ContentNotification>
                </div>
            </ContentWrapper>
        </template>

        <NotFound v-else>
            This playlist does not exist.
        </NotFound>
    </div>
</template>

<script>
    import store from 'store';
    import Params from 'data/enum/Params';
    import { mapState, mapActions } from 'vuex';
    import { getPlaylist } from 'utils/mediaUtils';
    import SongList from 'components/media/SongList';
    import NotFound from 'components/content/NotFound';
    import { MediaNamespace } from 'store/modules/media';
    import PlaylistHeader from 'components/media/PlaylistHeader';
    import ContentWrapper from 'components/content/ContentWrapper';
    import ContentNotification from 'components/content/ContentNotification';

    /**
     * Handle a route change in the application i.e. handle loading the playlist from the backend.
     *
     * @param to
     * @param next
     */
    const handleRouteChange = (to, next) => {
        const { [Params.PLAYLIST_ID]: id } = to.params;

        store.dispatch(`${MediaNamespace}/loadPlaylist`, id).then(next).catch(next);
    };

    export default {
        name: 'RoutePlaylist',

        beforeRouteEnter(to, from, next) {
            handleRouteChange(to, next);
        },

        beforeRouteUpdate(to, from, next) {
            handleRouteChange(to, next);
        },

        computed: {
            ...mapState({
                playlistId: state => state.route.params[Params.PLAYLIST_ID],
            }),

            /**
             * Get the playlist data from the store.
             *
             * @returns object
             */
            playlist() {
                return getPlaylist(this.playlistId);
            },
        },

        methods: {
            ...mapActions(MediaNamespace, {
                setPlaylistOrder: 'setPlaylistOrder',
                removePlaylistIndexes: 'removePlaylistIndexes',
            }),

            handleSongMove(fromIndex, toIndex) {
                const newOrder = this.playlist.songIds.slice();

                newOrder.splice(toIndex, 0, newOrder.splice(fromIndex, 1)[0]);

                this.setPlaylistOrder({ id: this.playlist.id, songIds: newOrder });
            },

            handlePlaylistRemove(index) {
                return this.removePlaylistIndexes({ id: this.playlist.id, indexes: [index] });
            },
        },

        components: {
            SongList,
            NotFound,
            PlaylistHeader,
            ContentWrapper,
            ContentNotification,
        },
    };
</script>

<style src="./Playlist.scss" lang="scss"></style>
