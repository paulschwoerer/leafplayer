<template>
    <div class="component-album-art" :class="{ 'playing-album': isCurrentlyPlayingAlbum, playing: isCurrentlyPlaying }">
        <transition name="fade">
            <div key="loaded" class="background" v-if="album.arts.length && artPreloaded" :style="{ backgroundImage: `url(${album.arts[0].src})` }" />
            <div key="not-loaded" class="background default" v-else />
        </transition>

        <div class="overlay">
            <div class="play-button" @click.prevent="onPlayPauseButtonClicked">
                <div class="icons">
                    <Icon v-show="!isCurrentlyPlaying" name="play_arrow" />
                    <Icon v-show="isCurrentlyPlaying" name="pause" />
                </div>
                <playing-indicator v-if="isCurrentlyPlaying"></playing-indicator>
            </div>
        </div>
    </div>
</template>

<script>
    import EventBus from 'store/eventbus';
    import Icon from 'components/content/Icon';
    import { mapGetters, mapActions } from 'vuex';
    import { MediaNamespace } from 'store/modules/media';
    import PlayingIndicator from 'components/PlayingIndicator';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';
    import {
        loadSongs,
        loadAlbumWithSongIds,
    } from 'utils/mediaUtils';

    export default {
        name: 'ComponentAlbumArt',

        props: {
            album: LeafPlayerPropTypes.album.isRequired,
        },

        created() {
            if (this.album.arts.length) {
                this.preloader = new Image();
                this.preloader.onload = () => { this.artPreloaded = true; };
                this.preloader.src = this.album.arts[0].src;
            }
        },

        beforeDestroy() {
            this.preloader.onload = null;
            this.preloader = null;
        },

        data() {
            return {
                artPreloaded: false,
            };
        },

        computed: {
            ...mapGetters('player', {
                currentSong: 'currentSong',
                isPlaying: 'isPlaying',
            }),

            isCurrentlyPlaying() {
                return this.isPlaying && this.isCurrentlyPlayingAlbum;
            },

            isCurrentlyPlayingAlbum() {
                return this.currentSong !== null && this.currentSong.album.id === this.album.id;
            },

            artworkSrc() {
                return `/artwork/${this.album.arts[0].file}`;
            },
        },

        methods: {
            ...mapActions(MediaNamespace, {
                loadAlbum: 'loadAlbum',
            }),

            onPlayPauseButtonClicked() {
                if (this.isCurrentlyPlaying) {
                    EventBus.$emit('player:pause');
                } else if (this.isCurrentlyPlayingAlbum) {
                    EventBus.$emit('player:play');
                } else {
                    // Load album if necessary and dispatch player event
                    loadAlbumWithSongIds(this.album.id)
                        .then(() => EventBus.$emit('player:setQueue', {
                            songIds: this.album.songIds,
                            index: 0,
                            play: true,
                        }));
                }
            },
        },

        components: {
            Icon,
            PlayingIndicator,
        },
    };
</script>

<style src="./AlbumArt.scss" lang="scss"></style>
