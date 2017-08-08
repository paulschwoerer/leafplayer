<template>
    <div class="component-player">
        <PlayerArt
            :currentSongId="currentSongId"
        ></PlayerArt>

        <PlayerControls
            :seek="seek"
            :muted="muted"
            :nextSong="next"
            :volume="volume"
            :setSeek="setSeek"
            :shuffle="shuffle"
            :duration="duration"
            :setMuted="setMuted"
            :isPlaying="isPlaying"
            :setVolume="setVolume"
            :queueSize="queueSize"
            :repeatMode="repeatMode"
            :setShuffle="setShuffle"
            :previousSong="previous"
            :currentSong="currentSong"
            :setRepeatMode="setRepeatMode"
            :onTogglePlaying="togglePlayPause"
            :currentQueueIndex="currentQueueIndex"
            :playbackHistorySize="playbackHistory.length"
        ></PlayerControls>
    </div>
</template>

<script>
    import Auth from 'auth/index';
    import { Howler, Howl } from 'howler';
    import { assert } from 'utils/debugUtils';
    import { loadSongs } from 'utils/mediaUtils';
    import { serializeUrlParams } from 'utils/urlUtils';
    import { PlayerNamespace } from 'store/modules/player';
    import { mapState, mapGetters, mapActions } from 'vuex';
    import { isBetween, getRandomInt } from 'utils/mathUtils';
    import { showSuccessNotification, showFailNotification } from 'utils/notificationUtils';

    import EventBus from 'store/eventbus';
    import PlayerMode from 'data/enum/PlayerMode';
    import PlayerRepeatMode from 'data/enum/PlayerRepeatMode';

    import PlayerArt from 'components/sidebar/PlayerArt';
    import PlayerControls from 'components/sidebar/PlayerControls';

    /**
     * Load songs from backend if necessary
     *
     * @param songIds
     * @param suppressAlert
     */
    /* eslint-disable max-len */
    const loadSongsIfNecessary = (songIds, suppressAlert = false) =>
        loadSongs(songIds)
            .then(() => !suppressAlert && showSuccessNotification(`${songIds.length} song${songIds.length !== 1 ? 's' : ''} added to queue.`))
            .catch(() => showFailNotification('Something went wrong while getting the song data.'));

    export default {
        name: 'ComponentPlayer',

        data() {
            return {
                howl: null,
                seek: 0,
                duration: 0,
                muted: false,
                volume: 1.0,
                repeatMode: PlayerRepeatMode.NONE,
                shuffle: false,
            };
        },

        mounted() {
            // create event listeners for player events
            EventBus.$on('player:play', this.play);
            EventBus.$on('player:pause', this.pause);
            EventBus.$on('player:setQueue', this.setQueue);
            EventBus.$on('player:moveQueueItem', this.moveQueueItem);
            EventBus.$on('player:addSongs', this.addSongs);
            EventBus.$on('player:playNext', this.playNext);
            EventBus.$on('player:removeFromQueue', this.removeFromQueue);
            EventBus.$on('player:clearQueue', this.clearQueue);

            // register shortcuts
            document.onkeypress = (e) => {
                const event = e || window.event;

                if (!['input', 'textarea'].find(item => item === document.activeElement.tagName.toLowerCase())) {
                    switch (event.keyCode || event.which) {
                        // N -> next song // TODO: move to different key?
                        case 110:
                            this.next();
                            break;
                        // P -> previous song // TODO: move to different key?
                        case 112:
                            this.previous();
                            break;
                        // Space -> toggle play/pause
                        case 32:
                            this.togglePlayPause();
                            break;
                        // M -> mute/unmute
                        case 109:
                            this.setMuted(!this.muted);
                            break;
                        // R -> toggle shuffle
                        case 114:
                            this.setShuffle(!this.shuffle);
                            break;
                        default:
                            break;
                    }

                    e.preventDefault();
                    e.stopPropagation();
                }
            };
        },

        beforeDestroy() {
            // remove shortcut listener
            document.onkeypress = () => {};

            this.stopHowl();

            EventBus.$off('player:play', this.play);
            EventBus.$off('player:pause', this.pause);
            EventBus.$off('player:setQueue', this.setQueue);
            EventBus.$off('player:moveQueueItem', this.moveQueueItem);
            EventBus.$off('player:addSongs', this.addSongs);
            EventBus.$off('player:playNext', this.playNext);
            EventBus.$off('player:removeFromQueue', this.removeFromQueue);
            EventBus.$off('player:clearQueue', this.clearQueue);
        },

        watch: {
            // update Howler volume on volume change
            volume(value) {
                Howler.volume(value);
            },

            // update Howler muted state on mute change
            muted(value) {
                Howler.mute(value);
            },
        },

        computed: {
            ...mapGetters(PlayerNamespace, {
                isPaused: 'isPaused',
                isPlaying: 'isPlaying',
                isStopped: 'isStopped',
                isLoading: 'isLoading',
                queueSize: 'queueSize',
                currentSong: 'currentSong',
            }),

            ...mapState({
                apiToken: state => state.auth.token,
                apiUrl: state => state.config.api.base,
            }),

            ...mapState(PlayerNamespace, {
                mode: state => state.mode,
                queue: state => state.queue,
                currentSongId: state => state.currentSongId,
                playbackHistory: state => state.playbackHistory,
                currentQueueIndex: state => state.currentQueueIndex,
            }),
        },

        methods: {
            ...mapActions(PlayerNamespace, {
                setMode: 'setMode',
                setStoreQueue: 'setQueue',
                setCurrentSongId: 'setCurrentSongId',
                setPlaybackHistory: 'setPlaybackHistory',
                setCurrentQueueIndex: 'setCurrentQueueIndex',
            }),

            /**
             * Start playing.
             */
            play() {
                if (this.isPaused) {
                    this.playHowl();
                } else if (this.isStopped) {
                    this.updateHowl(true);
                }
            },

            /**
             * Pause the player.
             */
            pause() {
                if (this.howl !== null) {
                    this.pauseHowl();
                }
            },

            /**
             * Stop the player.
             */
            stop() {
                if (this.howl !== null) {
                    this.stopHowl();
                }
            },

            /**
             *  Toggle the playing state of the player.
             */
            togglePlayPause() {
                if (this.isPlaying === false) {
                    this.play();
                } else {
                    this.pause();
                }
            },

            /**
             * Set the current queue index to the previous song.
             */
            previous() {
                if (this.seek > 5) {
                    this.setSeek(0);
                } else {
                    let index;
                    let overrideId = null;
                    let alterHistory = true;

                    if (this.shuffle) {
                        const history = this.playbackHistory.slice();

                        const last = history.pop();

                        if (isBetween(last.index, 0, this.queueSize) && this.queue[last.index] === last.id) {
                            index = last.index;
                        } else {
                            // song index is not in playlist anymore
                            index = -1;
                            overrideId = last.id;
                        }

                        alterHistory = false;

                        this.setPlaybackHistory({
                            history,
                        });
                    } else {
                        index = this.currentQueueIndex - 1;

                        if (index < 0) {
                            index = this.queueSize - 1;
                        }
                    }

                    this.setCurrentQueueIndex({ index });

                    this.updateHowl(this.isPlaying, overrideId, alterHistory);
                }
            },

            /**
             *  Set the current queue index to the next song.
             */
            next() {
                let index;
                if (this.shuffle) {
                    index = getRandomInt(0, this.queueSize - 1);
                } else {
                    index = this.currentQueueIndex + 1;

                    if (index >= this.queueSize) {
                        index = 0;
                    }
                }

                this.setCurrentQueueIndex({ index });

                this.updateHowl(this.isPlaying);
            },

            /**
             *  Update the playback history with the current song id and index.
             */
            updatePlaybackHistory() {
                const history = this.playbackHistory.slice();

                history.push({
                    index: this.currentQueueIndex,
                    id: this.currentSongId,
                });

                this.setPlaybackHistory({
                    history,
                });
            },

            /**
             * Add songs to the queue.
             *
             * @param songIds An array of song ids that should be added to the queue.
             * @param index The index at which those songs should be inserted. Defaults to the end of the queue.
             * @param suppressAlert
             */
            addSongs({ songIds, index, suppressAlert }) {
                if (songIds instanceof Array) {
                    const queueWasEmpty = this.queueSize === 0;
                    const playIndex = typeof index === 'undefined' ? this.queueSize : index;

                    loadSongsIfNecessary(songIds, suppressAlert);

                    const newSongIds = this.queue.slice(0, playIndex)
                        .concat(songIds).concat(this.queue.slice(playIndex));

                    this.setStoreQueue({ songIds: newSongIds });

                    if (queueWasEmpty) {
                        this.setQueueIndexToStart();
                    } else {
                        this.setCurrentQueueIndex({
                            index: this.currentQueueIndex > playIndex ?
                                this.currentQueueIndex + songIds.length : this.currentQueueIndex,
                        });
                    }
                }
            },

            /**
             * Set songs to play after the one currently playing.
             *
             * @param songIds
             */
            playNext({ songIds }) {
                const queueWasEmpty = this.queueSize === 0;

                this.addSongs({
                    songIds,
                    index: this.currentQueueIndex + 1,
                });

                // disable shuffle so songs will actually be played next
                this.setShuffle(false);

                if (queueWasEmpty) {
                    this.setQueueIndexToStart();
                }
            },

            /**
             * Set the queue index to the first song in the queue.
             *
             * @param startPlaying
             */
            setQueueIndexToStart(startPlaying = false) {
                this.setCurrentQueueIndex({ index: 0 });
                this.updateHowl(startPlaying);
            },

            /**
             * Completely replace the queue by the given songs.
             *
             * @param songIds An array of song ids.
             * @param index The index at which to start playing. Defaults to 0.
             * @param play Whether to start playing after adding the songs. Defaults to false.
             * @param suppressAlert
             */
            setQueue({ songIds, index, play, suppressAlert }) {
                if (songIds instanceof Array) {
                    const playIndex = typeof index === 'undefined' ? 0 : index;
                    const startPlaying = typeof play === 'undefined' ? false : play;

                    loadSongsIfNecessary(songIds, suppressAlert);

                    this.setStoreQueue({ songIds });

                    assert(isBetween(playIndex, 0, this.queueSize), 'Index to start playback is out of bounds.');

                    this.setCurrentQueueIndex({ index: playIndex });

                    this.updateHowl(startPlaying);
                }
            },

            /**
             * Change the order of the queue.
             */
            moveQueueItem({ fromIndex, toIndex }) {
                assert(isBetween(fromIndex, 0, this.queueSize), '`fromIndex` is out of bounds.');
                assert(isBetween(toIndex, 0, this.queueSize), '`toIndex` is out of bounds.');

                if (fromIndex !== toIndex) {
                    const newOrder = this.queue.slice();
                    newOrder.splice(toIndex, 0, newOrder.splice(fromIndex, 1)[0]);

                    this.setStoreQueue({ songIds: newOrder });

                    // Handle current playing index
                    if (toIndex <= this.currentQueueIndex && fromIndex > this.currentQueueIndex) {
                        this.setCurrentQueueIndex({ index: this.currentQueueIndex + 1 });
                    } else if (fromIndex === this.currentQueueIndex) {
                        this.setCurrentQueueIndex({ index: toIndex });
                    } else if (fromIndex < this.currentQueueIndex && toIndex >= this.currentQueueIndex) {
                        this.setCurrentQueueIndex({ index: this.currentQueueIndex - 1 });
                    }
                }
            },

            /**
             * Remove a specific index from the player queue.
             *
             * @param index
             */
            removeFromQueue({ index }) {
                const songIds = this.queue.slice();

                songIds.splice(index, 1);

                if (index <= this.currentQueueIndex) {
                    this.setCurrentQueueIndex({ index: this.currentQueueIndex - 1 });
                }

                this.setStoreQueue({ songIds });
            },

            handleAudioResourceError() {
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('[Player] Error while loading audio resource.');
                }

                // Stop the music
                this.stopHowl();

                // Try to refresh the session
                Auth.refresh().then(() => {
                    // successful, let's start the audio playback again
                    this.play();
                });
            },

            /**
             * Update the howler instance.
             *
             * @param startPlaying
             * @param overrideId Pass a song id that should be played while ignoring the current queue index
             * @param alterHistory Add song to playback history?
             */
            updateHowl(startPlaying = false, overrideId = null, alterHistory = true) {
                if (this.howl !== null) {
                    this.stopHowl();
                }

                if (isBetween(this.currentQueueIndex, 0, this.queueSize) || overrideId !== null) {
                    this.setCurrentSongId({
                        id: overrideId !== null ? overrideId : this.queue[this.currentQueueIndex],
                    });

                    if (alterHistory === true) {
                        this.updatePlaybackHistory();
                    }

                    this.howl = new Howl({
                        src: `${this.apiUrl}song/${this.currentSongId}/stream${serializeUrlParams({
                            token: this.apiToken,
                        })}`,
                        format: ['mp3'],
                        html5: true,
                        onend: this.onEnded,
                        onload: () => {
                            this.duration = this.howl.duration();
                        },
                        onloaderror: () => this.handleAudioResourceError(),
                        onplay: () => requestAnimationFrame(this.updateSeek),
                    });

                    if (startPlaying) {
                        this.playHowl();
                    }
                }
            },

            /**
             * Start the howling.
             */
            playHowl() {
                assert(this.howl !== null, 'Howl should not be null when starting to play.');

                this.howl.play();
                this.setMode({ mode: PlayerMode.PLAYING });
            },

            /**
             * Pause the howling.
             */
            pauseHowl() {
                assert(this.howl !== null, 'Howl should not be null when pausing it.');

                this.howl.pause();
                this.setMode({ mode: PlayerMode.PAUSED });
            },

            /**
             * Stop the howling.
             */
            stopHowl() {
                if (this.howl !== null) {
                    this.howl.stop();
                    this.howl.unload();
                    this.howl = null;
                }

                this.setMode({ mode: PlayerMode.STOPPED });
            },

            /**
             * Update the howl's current seek to represent that in the player controls.
             */
            updateSeek() {
                if (this.howl !== null) {
                    // Fix for howl.seek() returning the howl instance
                    if (typeof this.howl.seek() !== 'number') {
                        this.seek = 0;
                    } else {
                        this.seek = this.howl.seek();
                    }

                    if (this.howl.playing()) {
                        requestAnimationFrame(this.updateSeek);
                    }
                } else {
                    this.seek = 0;
                    this.duration = 0;
                }
            },

            /**
             * This method is called whenever a song ends.
             */
            onEnded() {
                if (this.repeatMode === PlayerRepeatMode.ONE) {
                    this.setSeek(0);
                    this.playHowl();
                } else if (this.currentQueueIndex === this.queueSize - 1 && this.shuffle === false) {
                    this.onQueueEnded();
                } else {
                    this.next();
                }
            },

            /**
             * This method is called once the queue reaches it's end.
             */
            onQueueEnded() {
                if (this.repeatMode === PlayerRepeatMode.ALL) {
                    this.next();
                } else {
                    this.stopHowl();
                }
            },

            /**
             * Set the seek on the howl.
             *
             * @param value
             */
            setSeek(value) {
                if (this.howl !== null) {
                    this.howl.seek(value);
                }
            },

            /**
             * Set whether the player should be in shuffle mode or not.
             */
            setShuffle(shuffle) {
                this.shuffle = shuffle;
            },

            /**
             * Set the player repeat mode.
             */
            setRepeatMode(mode) {
                this.repeatMode = mode;
            },

            /**
             * Set muted state on howl.
             *
             * @param muted
             */
            setMuted(muted) {
                this.muted = muted;
            },

            /**
             * Set volume on howl.
             *
             * @param volume
             */
            setVolume(volume) {
                this.volume = volume;
            },
        },

        components: {
            PlayerArt,
            PlayerControls,
        },
    };
</script>

<style lang="scss" src="./Player.scss"></style>
