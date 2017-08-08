<template>
    <div class="component-side-bar-playlist-container">
        <ul>
            <SideBarCreatePlaylist />
        </ul>
        <ul>
            <SideBarPlaylistLink v-for="playlist in playlists" :key="playlist.id" :playlist="playlist" />
        </ul>
        <InfiniteLoader
            :loadMoreItems="loadMorePlaylists"
            :finishedLoading="isFinishedLoadingPlaylists"
            loaderVariation="light"
            loaderSize="sm"
        />
    </div>
</template>

<script>
    import Auth from 'auth';
    import { mapState, mapActions } from 'vuex';
    import ModelType from 'data/enum/ModelType';
    import { parsePlaylist } from 'utils/mediaUtils';
    import { sortByPropertyCI } from 'utils/arrayUtils';
    import { MediaNamespace } from 'store/modules/media';
    import { getAllModelsOfType } from 'utils/modelUtils';
    import InfiniteLoader from 'components/InfiniteLoader';
    import SideBarPlaylistLink from 'components/sidebar/SideBarPlaylistLink';
    import SideBarCreatePlaylist from 'components/sidebar/SideBarCreatePlaylist';

    export default {
        name: 'ComponentSideBarPlaylistContainer',

        data() {
            return {};
        },

        computed: {
            ...mapState({
                userIsDragging: state => state.dnd.dragging,
            }),

            ...mapState(MediaNamespace, {
                userPlaylistOffset: state => state.userPlaylistOffset,
                totalUserPlaylists: state => state.totalUserPlaylists,
            }),

            /**
             * Get the currently authenticated user.
             *
             * @returns object
             */
            user() {
                return Auth.user();
            },

            /**
             * Get all loaded playlists of the current user. Sorted by name.
             *
             * @returns Array
             */
            playlists() {
                return getAllModelsOfType(ModelType.PLAYLIST)
                    .filter(playlist => (playlist.owner ? playlist.owner.id : playlist.ownerId) === this.user.id)
                    .map(parsePlaylist)
                    .sort(sortByPropertyCI('name'));
            },

            /**
             * Check if there are any more unloaded playlists from the current user.
             *
             * @returns boolean
             */
            isFinishedLoadingPlaylists() {
                return !isNaN(this.totalUserPlaylists) && (this.userPlaylistOffset >= this.totalUserPlaylists);
            },
        },

        methods: {
            ...mapActions(MediaNamespace, {
                loadUserPlaylists: 'loadUserPlaylists',
            }),

            /**
             * Load more playlists from the currently authenticated user from the backend.
             *
             * @returns Promise
             */
            loadMorePlaylists() {
                return this.loadUserPlaylists({
                    offset: this.userPlaylistOffset,
                    take: 20,
                });
            },
        },

        components: {
            InfiniteLoader,
            SideBarPlaylistLink,
            SideBarCreatePlaylist,
        },
    };
</script>

<style src="./SideBarPlaylistContainer.scss" lang="scss"></style>
