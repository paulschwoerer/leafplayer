<template>
    <tr class="component-song-list-entry" :class="{ 'is-dragging': isDragging, 'is-over': isOver }">
        <td class="track-number" @click="onPlayPauseClicked(song)">
            <div class="icons">
                <Icon v-show="!isPlaying" name="play_arrow" />
                <Icon v-show="isPlaying" name="pause" />
            </div>
            <span v-if="showTrackNumber && !isPlaying">{{song.track}}</span>
            <span v-if="showIndex && !isPlaying">{{index + 1}}</span>
            <PlayingIndicator v-if="isPlaying" size="sm" variation="dark"></PlayingIndicator>
        </td>
        <td class="title ellipsis" :title="song.title">{{song.title}}</td>
        <td v-if="showArtist" class="artist ellipsis" :title="song.artist.name">
            <router-link :to="artistLink">{{song.artist.name}}</router-link>
        </td>
        <td v-if="showAlbum" class="album ellipsis" :title="song.album.name">
            <router-link :to="albumLink">{{song.album.name}}</router-link>
        </td>
        <td v-if="showDuration" class="duration">{{songDurationHumanReadable}}</td>
        <td v-if="showOptions" class="options" @click.stop="handleOptionsButtonClicked">
            <Icon rel="optionsButton" name="more_vert" />
            <a @click.stop="" :href="songDownloadLink"><Icon name="file_download" /></a>

            <SongPopover
                v-if="popoverOpened"
                :song="song"
                :showPlaylistRemove="isPlaylist"
                :showQueueRemove="isQueue"
                :onRemoveFromQueue="() => onRemoveFromQueue(index)"
                :onRemoveFromPlaylist="() => onRemoveFromPlaylist(index)"
            />
        </td>
    </tr>
</template>

<script>
    import VueTypes from 'vue-types';
    import Params from 'data/enum/Params';
    import Icon from 'components/content/Icon';
    import PageNames from 'data/enum/PageNames';
    import { mapState, mapActions } from 'vuex';
    import { timeString } from 'utils/timeUtils';
    import { serializeUrlParams } from 'utils/urlUtils';
    import SongPopover from 'components/media/SongPopover';
    import PlayingIndicator from 'components/PlayingIndicator';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentSongListEntry',

        props: {
            // Show track number from song tags
            showTrackNumber: VueTypes.bool.isRequired,
            // Show 1 based song index
            showIndex: VueTypes.bool.isRequired,
            showArtist: VueTypes.bool.isRequired,
            showAlbum: VueTypes.bool.isRequired,
            showDuration: VueTypes.bool.isRequired,
            showOptions: VueTypes.bool.isRequired,
            isPlaying: VueTypes.bool.isRequired,
            song: LeafPlayerPropTypes.song.isRequired,
            isSortable: VueTypes.bool.def(false),
            isDragging: VueTypes.bool.isRequired,
            isOver: VueTypes.bool.isRequired,
            index: VueTypes.number.isRequired,
            allowSongSorting: VueTypes.bool.isRequired,

            // Callback when a song list entry is dropped on another
            onSongDropped: VueTypes.func.isRequired,

            // Callback for when the play/pause button is clicked
            onPlayPauseClicked: VueTypes.func.isRequired,

            // playlist & queue specific
            isPlaylist: VueTypes.bool.isRequired,
            onRemoveFromPlaylist: VueTypes.func.isRequired,
            isQueue: VueTypes.bool.isRequired,
            onRemoveFromQueue: VueTypes.func.isRequired,

            // Popover props
            onPopoverOpen: VueTypes.func.isRequired,
            onPopoverClose: VueTypes.func.isRequired,
            popoverOpened: VueTypes.bool.isRequired,
        },

        computed: {
            ...mapState({
                apiUrl: state => state.config.api.base,
                authToken: state => state.auth.token,
            }),

            songDurationHumanReadable() {
                return timeString(this.song.duration);
            },

            songDownloadLink() {
                return `${this.apiUrl}song/${this.song.id}/download${serializeUrlParams({
                    token: this.authToken,
                })}`;
            },

            artistLink() {
                return {
                    name: PageNames.ARTIST,
                    params: { [Params.ARTIST_ID]: this.song.artist.id },
                };
            },

            albumLink() {
                return {
                    name: PageNames.ALBUM,
                    params: { [Params.ALBUM_ID]: this.song.album.id },
                };
            },
        },

        methods: {
            ...mapActions('modal', {
                openModal: 'openModal',
            }),

            handleOptionsButtonClicked(e) {
                if (this.popoverOpened) {
                    this.onPopoverClose();
                } else {
                    this.onPopoverOpen(this.index);
                }
            },
        },

        components: {
            Icon,
            SongPopover,
            PlayingIndicator,
        },
    };
</script>

<style src="./SongListEntry.scss" lang="scss"></style>
