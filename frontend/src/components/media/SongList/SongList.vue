<template>
    <div class="component-song-list">
        <table class="list">
            <thead>
                <tr>
                    <th class="center"><span v-if="showTrackNumber">#</span></th>
                    <th>Title</th>
                    <th v-if="showArtist">Artist</th>
                    <th v-if="showAlbum">Album</th>
                    <th v-if="showDuration">Dur.</th>
                    <th v-if="showOptions"></th>
                </tr>
            </thead>
            <tbody>
                <SongListEntry
                    v-for="(song, index) in songs"
                    :key="index + song.id"

                    :song="song"
                    :index="index"
                    :showAlbum="showAlbum"
                    :showArtist="showArtist"
                    :showIndex="showIndex"
                    :showTrackNumber="showTrackNumber"
                    :showOptions="showOptions"
                    :showDuration="showDuration"
                    :allowSongSorting="allowSongSorting"
                    :onSongDropped="onSongDropped"
                    :onPlayPauseClicked="handlePlayPauseClick"
                    :isPlaying="isSongPlaying(song, index)"

                    :isQueue="isQueue"
                    :isPlaylist="isPlaylist"
                    :onRemoveFromQueue="onRemoveFromQueue"
                    :onRemoveFromPlaylist="onRemoveFromPlaylist"

                    :onPopoverOpen="handlePopoverOpen"
                    :onPopoverClose="handlePopoverClose"
                    :popoverOpened="openedPopoverIndex === index"
                />
            </tbody>
        </table>

        <InfiniteLoader :loadMoreItems="loadMoreSongs" :finishedLoading="finishedLoading" loaderSize="sm" />
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import EventBus from 'store/eventbus';
    import { MediaNamespace } from 'store/modules/media';
    import InfiniteLoader from 'components/InfiniteLoader';
    import { PlayerNamespace } from 'store/modules/player';
    import { mapState, mapActions, mapGetters } from 'vuex';
    import SongListEntry from 'components/media/SongListEntry';
    import { getSong, setQueueFromSongs } from 'utils/mediaUtils';

    const BULK_SIZE = 40;

    export default {
        name: 'ComponentSongList',

        props: {
            // An array of songs ids to display
            songIds: VueTypes.arrayOf(VueTypes.string).isRequired,

            // Modifiers to show different fields in the song list
            showIndex: VueTypes.bool.def(false),
            showTrackNumber: VueTypes.bool.def(false),
            showArtist: VueTypes.bool.def(false),
            showAlbum: VueTypes.bool.def(false),
            showDuration: VueTypes.bool.def(true),
            showOptions: VueTypes.bool.def(true),

            // Callback when a song list entry is dropped on another
            // Returns the index of the dropped song as the first argument,
            // the index of the song it was dropped on as the second
            onSongDropped: VueTypes.func,

            // Callback for when a song is requested to play
            onSongPlay: VueTypes.func.def(setQueueFromSongs),

            // Allow dropping of song list entries on others
            allowSongSorting: VueTypes.bool.def(false),

            // playlist & queue specific
            isPlaylist: VueTypes.bool.def(false),
            onRemoveFromPlaylist: VueTypes.func,
            isQueue: VueTypes.bool.def(false),
            onRemoveFromQueue: VueTypes.func,
        },

        data() {
            return {
                currentOffset: 0,

                openedPopoverIndex: NaN,
            };
        },

        mounted() {
            window.addEventListener('click', this.handlePopoverClose);
        },

        beforeDestroy() {
            window.removeEventListener('click', this.handlePopoverClose);
        },

        computed: {
            ...mapGetters(PlayerNamespace, {
                currentSong: 'currentSong',
                isPlaying: 'isPlaying',
            }),

            ...mapState(PlayerNamespace, {
                currentQueueIndex: state => state.currentQueueIndex,
            }),

            totalSongs() {
                return this.songIds.length;
            },

            finishedLoading() {
                return this.currentOffset >= this.totalSongs;
            },

            songs() {
                return this.songIds.map(id => getSong(id)).filter(song => !!song);
            },
        },

        methods: {
            ...mapActions(MediaNamespace, {
                loadSongsById: 'loadSongsById',
            }),

            loadMoreSongs() {
                const ids = this.songIds.slice(this.currentOffset, this.currentOffset + BULK_SIZE);

                return this.loadSongsById(ids).then((data) => {
                    if (!(data instanceof Array)) {
                        throw new Error('[SongList] Returned data needs to be an array');
                    }

                    this.currentOffset += data.length;
                }).catch(error => console.error('[SongList] An error occurred while fetching songs: ', error));
            },

            handlePlayPauseClick(song) {
                const isCurrentSong = this.currentSong !== null && song.id === this.currentSong.id;

                if (isCurrentSong && this.isPlaying === true) {
                    EventBus.$emit('player:pause');
                } else if (isCurrentSong && this.isPlaying === false) {
                    EventBus.$emit('player:play');
                } else {
                    const songIds = this.songs.map(song => song.id);

                    // Will either trigger the callback in the props or call the default handler
                    this.onSongPlay(songIds, song.id);
                }
            },

            isSongPlaying(song, index) {
                const somethingPlaying = this.isPlaying && this.currentSong !== null;

                if (this.isQueue) {
                    return somethingPlaying && this.currentQueueIndex === index && this.currentSong.id === song.id;
                }

                return somethingPlaying && this.currentSong.id === song.id;
            },

            handlePopoverOpen(index) {
                this.openedPopoverIndex = index;
            },

            handlePopoverClose() {
                this.openedPopoverIndex = NaN;
            },
        },

        components: {
            SongListEntry,
            InfiniteLoader,
        },
    };
</script>

<style src="./SongList.scss" lang="scss"></style>
