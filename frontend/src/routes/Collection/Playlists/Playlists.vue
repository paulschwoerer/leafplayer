<template>
    <div class="route-collection-playlists">
        <form @submit.prevent="submitNewPlaylist">
            <Input label="Create playlist ..." v-model="newPlaylistName"/>
        </form>

        <transition name="fade">
            <ContentNotification v-if="totalPlaylists === 0" icon="playlist_add">
                There are no playlists in this collection. Why not create one?
            </ContentNotification>
        </transition>

        <Waterfall>
            <PlaylistCard v-for="playlist in playlistCollection" :key="playlist.id" :playlist="playlist" />
        </Waterfall>

        <transition name="fade">
            <InfiniteLoader :loadMoreItems="loadMorePlaylists" :finishedLoading="isFinishedLoading" />
        </transition>
    </div>
</template>

<script>
    import Params from 'data/enum/Params';
    import Input from 'components/form/Input';
    import { mapActions, mapState } from 'vuex';
    import PageNames from 'data/enum/PageNames';
    import ModelType from 'data/enum/ModelType';
    import { parsePlaylist } from 'utils/mediaUtils';
    import { sortByPropertyCI } from 'utils/arrayUtils';
    import Waterfall from 'components/content/Waterfall';
    import { MediaNamespace } from 'store/modules/media';
    import { getAllModelsOfType } from 'utils/modelUtils';
    import PlaylistCard from 'components/media/PlaylistCard';
    import InfiniteLoader from 'components/InfiniteLoader';
    import ContentNotification from 'components/content/ContentNotification';

    export default {
        name: 'RouteCollectionPlaylists',

        data() {
            return {
                newPlaylistName: '',
            };
        },

        computed: {
            ...mapState(MediaNamespace, {
                playlistOffset: state => state.playlistOffset,
                totalPlaylists: state => state.totalPlaylists,
            }),

            /**
             * Sort all playlists by name.
             *
             * @returns {Array}
             */
            playlistCollection() {
                return getAllModelsOfType(ModelType.PLAYLIST)
                    .map(parsePlaylist)
                    .sort(sortByPropertyCI('name'));
            },

            isFinishedLoading() {
                return !isNaN(this.totalPlaylists) && (this.playlistOffset >= this.totalPlaylists);
            },
        },

        methods: {
            ...mapActions(MediaNamespace, {
                createPlaylist: 'createPlaylist',
                loadPlaylists: 'loadPlaylists',
            }),

            submitNewPlaylist() {
                if (this.newPlaylistName.length > 0) {
                    this.createPlaylist({ name: this.newPlaylistName })
                        .then(({ id }) => this.$router.push({
                            name: PageNames.PLAYLIST,
                            params: {
                                [Params.PLAYLIST_ID]: id,
                            },
                        }));
                }
            },

            loadMorePlaylists() {
                return this.loadPlaylists({
                    offset: this.playlistOffset,
                    take: 50,
                });
            },
        },

        components: {
            Input,
            Waterfall,
            PlaylistCard,
            InfiniteLoader,
            ContentNotification,
        },
    };
</script>

<style src="./Playlists.scss" lang="scss"></style>
