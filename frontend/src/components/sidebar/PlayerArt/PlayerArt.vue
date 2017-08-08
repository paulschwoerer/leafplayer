<template>
    <div class="component-player-art">
        <div class="art">
            <transition name="fade">
                <div key="loaded" class="background" v-if="hasAlbumArts && artPreloaded" :style="{ backgroundImage: `url(${currentSong.album.arts[0].src})` }" />
                <div key="not-loaded" class="background default" v-else />
            </transition>
        </div>
        <div v-if="currentSong" class="details">
            <ul>
                <li class="current-title">
                    <router-link :to="albumLink" class="ellipsis" title="Show album">
                        {{currentSong.title}}
                    </router-link>
                </li>
                <li class="current-artist">
                    <router-link :to="artistLink" class="ellipsis" title="Show artist">
                        {{currentSong.artist.name}}
                    </router-link>
                </li>
            </ul>
        </div>
        <transition name="fade">
            <div class="drop-overlay" v-show="userIsDragging">
                <Icon name="playlist_add" />
                Drop here to enqueue
            </div>
        </transition>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Params from 'data/enum/Params';
    import { getSong } from 'utils/mediaUtils';
    import Icon from 'components/content/Icon';
    import { mapState, mapActions } from 'vuex';
    import PageNames from 'data/enum/PageNames';
    import { MediaNamespace } from 'store/modules/media';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentPlayerArt',

        props: {
            currentSongId: VueTypes.string,
        },

        data() {
            return {
                artPreloaded: false,
            };
        },

        created() {
            this.preloader = new Image();
            this.preloader.onload = () => { this.artPreloaded = true; };
        },

        beforeDestroy() {
            this.preloader.onload = null;
            this.preloader = null;
        },

        watch: {
            currentSong(song) {
                // Load the album of the currently playing song, if it is not loaded yet.
                if (song && (song.album || song.albumId) && (!song.album || !song.album.arts)) {
                    this.loadAlbum(song.album ? song.album.id : song.albumId);
                }
            },

            hasAlbumArts(value) {
                if (value) {
                    // Preload the current album art if one id defined
                    this.preloadAlbumArt();
                }
            },
        },

        computed: {
            ...mapState({
                userIsDragging: state => state.dnd.dragging,
            }),

            albumLink() {
                return {
                    name: PageNames.ALBUM,
                    params: { [Params.ALBUM_ID]: this.currentSong.album.id },
                };
            },

            artistLink() {
                return {
                    name: PageNames.ARTIST,
                    params: {
                        [Params.ARTIST_ID]: this.currentSong.artist.id,
                    },
                };
            },

            /**
             * Check if there are any album arts available for the current song.
             *
             * @returns boolean
             */
            hasAlbumArts() {
                return this.currentSong
                    && this.currentSong.album
                    && this.currentSong.album.arts
                    && this.currentSong.album.arts.length;
            },

            /**
             * Use the getSong() helper, as we need the album art of the song's album.
             *
             * @returns Object
             */
            currentSong() {
                return getSong(this.currentSongId);
            }
        },

        methods: {
            ...mapActions(MediaNamespace, {
                loadAlbum: 'loadAlbum',
            }),

            preloadAlbumArt() {
                this.artPreloaded = false;

                this.preloader.src = this.currentSong.album.arts[0].src;
            },
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./PlayerArt.scss" lang="scss"></style>
