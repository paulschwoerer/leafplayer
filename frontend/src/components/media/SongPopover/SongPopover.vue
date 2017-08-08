<template>
    <div class="component-song-popover">
        <div class="header">
            <div class="art">
                <img v-if="song.album.arts && song.album.arts.length && artPreloaded" :src="song.album.arts[0].src">
                <img v-else src="../../../assets/img/album-default.jpg">
            </div>
            <div class="title">
                <p class="ellipsis" :title="song.title">{{song.title}}</p>
                <p class="ellipsis"><small>by</small>
                    <router-link :to="artistLink">
                        {{song.artist.name}}
                    </router-link>
                </p>
            </div>
        </div>

        <div class="content">
            <ul>
                <li @click="handlePlayNext">Play next</li>
                <li @click="handleEnqueue">Enqueue</li>
                <li @click.stop="handleAddToPlaylist">Add to playlist</li>
                <li v-if="showPlaylistRemove" @click="onRemoveFromPlaylist">Remove from playlist</li>
                <li v-if="showQueueRemove" @click="onRemoveFromQueue">Remove from queue</li>
            </ul>
        </div>

        <div class="playlists" :class="{ visible: addingToPlaylist }">
            <div class="back" @click.stop="() => { addingToPlaylist = false; }" >
                <Icon name="arrow_back" />
            </div>
            <ul>
                <li class="playlist" @click="handleCreatePlaylist"><Icon name="add" />Create new playlist</li>
                <li class="playlist" v-for="playlist in playlists" key="playlist.id" @click="() => handlePlaylistClicked(playlist)">
                    <Icon name="playlist_add" />{{playlist.name}}
                </li>
            </ul>
            <InfiniteLoader
                :loadMoreItems="loadMorePlaylists"
                :finishedLoading="isFinishedLoadingPlaylists"
                loaderSize="sm"
            />
        </div>
    </div>
</template>

<script>
    import Auth from 'auth';
    import VueTypes from 'vue-types';
    import Params from 'data/enum/Params';
    import EventBus from 'store/eventbus';
    import Icon from 'components/content/Icon';
    import { mapActions, mapState } from 'vuex';
    import PageNames from 'data/enum/PageNames';
    import ModelType from 'data/enum/ModelType';
    import { parsePlaylist } from 'utils/mediaUtils';
    import { sortByPropertyCI } from 'utils/arrayUtils';
    import { MediaNamespace } from 'store/modules/media';
    import { ModalNamespace } from 'store/modules/modal';
    import { getAllModelsOfType } from 'utils/modelUtils';
    import InfiniteLoader from 'components/InfiniteLoader';
    import { showSuccessNotification } from 'utils/notificationUtils';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';
    import CreatePlaylistModal from 'components/modal/CreatePlaylistModal';

    export default {
        name: 'ComponentSongPopover',

        props: {
            song: LeafPlayerPropTypes.song.isRequired,

            showPlaylistRemove: VueTypes.bool.isRequired,
            onRemoveFromPlaylist: VueTypes.func.isRequired,
            showQueueRemove: VueTypes.bool.isRequired,
            onRemoveFromQueue: VueTypes.func.isRequired,
        },

        data() {
            return {
                addingToPlaylist: false,

                artPreloaded: false,
            };
        },

        created() {
            this.preloader = new Image();
            this.preloader.onload = () => { this.artPreloaded = true; };
        },

        mounted() {
            if (!this.song.album.arts) {
                this.loadAlbum(this.song.album.id).then(() => {
                    this.preloader.src = this.song.album.arts[0].src;
                });
            } else {
                this.preloader.src = this.song.album.arts[0].src;
            }
        },

        beforeDestroy() {
            this.preloader.onload = null;
            this.preloader = null;
        },

        computed: {
            ...mapState(MediaNamespace, {
                userPlaylistOffset: state => state.userPlaylistOffset,
                totalUserPlaylists: state => state.totalUserPlaylists,
            }),

            user() {
                return Auth.user();
            },

            playlists() {
                return getAllModelsOfType(ModelType.PLAYLIST)
                    .filter(playlist => (playlist.owner ? playlist.owner.id : playlist.ownerId) === this.user.id)
                    .map(parsePlaylist)
                    .sort(sortByPropertyCI('name'));
            },

            artistLink() {
                return {
                    name: PageNames.ARTIST,
                    params: { [Params.ARTIST_ID]: this.song.artist.id },
                };
            },

            isFinishedLoadingPlaylists() {
                return !isNaN(this.totalUserPlaylists) && (this.userPlaylistOffset >= this.totalUserPlaylists);
            },
        },

        methods: {
            ...mapActions(MediaNamespace, {
                loadAlbum: 'loadAlbum',
                loadUserPlaylists: 'loadUserPlaylists',
                addSongsToPlaylist: 'addSongsToPlaylist',
            }),

            ...mapActions({
                openModal: `${ModalNamespace}/openModal`,
            }),

            handlePlayNext() {
                EventBus.$emit('player:playNext', {
                    songIds: [this.song.id],
                });
            },

            handleEnqueue() {
                EventBus.$emit('player:addSongs', {
                    songIds: [this.song.id],
                });
            },

            handleAddToPlaylist() {
                this.addingToPlaylist = true;
            },

            handlePlaylistClicked(playlist) {
                this.addSongsToPlaylist({ id: playlist.id, songIds: [this.song.id] })
                    .then(() => showSuccessNotification(`Song added to playlist '${playlist.name}'`));
            },

            handleCreatePlaylist() {
                return this.openModal({
                    component: CreatePlaylistModal,
                    props: {
                        songIdsToAdd: [this.song.id],
                    },
                });
            },

            loadMorePlaylists() {
                return this.loadUserPlaylists({
                    offset: this.userPlaylistOffset,
                    take: 20,
                });
            },
        },

        components: {
            Icon,
            InfiniteLoader,
        },
    };
</script>

<style src="./SongPopover.scss" lang="scss"></style>
