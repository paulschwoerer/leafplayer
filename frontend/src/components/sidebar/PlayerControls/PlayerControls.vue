<template>
    <div class="component-player-controls">
        <button
            @click.prevent="previousSong"
            :disabled="controlButtonsDisabled || !previousButtonEnabled"
            class="button-previous"
        >
            <Icon name="skip_previous" />
        </button>
        <button
            @click.prevent="onTogglePlaying"
            :disabled="controlButtonsDisabled"
            class="button-play"
        >
            <Icon v-show="!isPlaying" name="play_arrow"/>
            <Icon v-show="isPlaying" name="pause"/>
        </button>
        <button
            @click.prevent="nextSong"
            :disabled="controlButtonsDisabled || !nextButtonEnabled"
            class="button-next"
        >
            <Icon name="skip_next" />
        </button>

        <div class="advanced-controls">
            <div class="volume-controls">
                <button class="mute" role="button" tabindex="0" @click="toggleMute">
                    <Icon v-show="muted" name="volume_off" />
                    <Icon v-show="!muted && volume == 0" name="volume_mute" />
                    <Icon v-show="!muted && volume > 0 && volume <= 0.5" name="volume_down" />
                    <Icon v-show="!muted && volume > 0.5" name="volume_up" />
                </button>
                <div class="volume-bar-container" :class="{ hover: volumeMouseDown }">
                    <div ref="volumeElement" @mousedown="onVolumeMousedown" class="volume-bar">
                        <div class="volume-bar-value" :style="{ width: (volume * 100) + '%'}"></div>
                    </div>
                </div>
            </div>
            <button @click.prevent="toggleShuffle" class="shuffle" role="button" tabindex="0">
                <Icon :class="{ active: shuffle }" name="shuffle"/>
            </button>
            <button @click.prevent="cycleRepeatMode" class="repeat-mode" role="button" tabindex="0">
                <Icon v-if="repeatModeNone" name="repeat" />
                <Icon v-if="repeatModeAll" class="active" name="repeat" />
                <Icon v-if="repeatModeOne" class="active" name="repeat_one" />
            </button>
           <!-- <button class="equalizer" role="button" tabindex="0">
                <Icon name="equalizer" />
            </button>-->
            <button class="queue" role="button" tabindex="0">
                <router-link :to="queueLink" tag="i" title="View your current queue" class="material-icons component-icon">
                    queue_music
                </router-link>
            </button>
        </div>
        <div class="progress">
            <div ref="seekerElement" class="seek-bar" @mousedown="onSeekerMousedown">
                <div class="play-bar" :style="{ width: progress + '%'}"></div>
            </div>
        </div>
        <div class="timers">
            <div class="current-time" role="timer" aria-label="time">{{seekHumanReadable}}</div>
            <div class="duration" role="timer" aria-label="duration">{{durationHumanReadable}}</div>
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Icon from 'components/content/Icon';
    import PageNames from 'data/enum/PageNames';
    import { timeString } from 'utils/timeUtils';
    import PlayerRepeatMode from 'data/enum/PlayerRepeatMode';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentPlayerControls',

        props: {
            setShuffle: VueTypes.func.isRequired,
            nextSong: VueTypes.func.isRequired,
            previousSong: VueTypes.func.isRequired,
            setSeek: VueTypes.func.isRequired,
            setRepeatMode: VueTypes.func.isRequired,
            setVolume: VueTypes.func.isRequired,
            onTogglePlaying: VueTypes.func.isRequired,
            playbackHistorySize: VueTypes.number.isRequired,
            setMuted: VueTypes.func.isRequired,
            repeatMode: VueTypes.string.isRequired,
            shuffle: VueTypes.bool.isRequired,
            muted: VueTypes.bool.isRequired,
            isPlaying: VueTypes.bool.isRequired,
            volume: VueTypes.number.isRequired,
            seek: VueTypes.number.isRequired,
            duration: VueTypes.number.isRequired,
            currentSong: LeafPlayerPropTypes.song,
            currentQueueIndex: VueTypes.number.isRequired,
            queueSize: VueTypes.number.isRequired,
        },

        data() {
            return {
                volumeMouseDown: false,
                seekerMouseDown: false,
                variableSeek: 0,
            };
        },

        mounted() {
            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
        },

        computed: {
            seekHumanReadable() {
                return timeString(this.seek);
            },

            durationHumanReadable() {
                return timeString(this.duration);
            },

            progress() {
                if (this.seekerMouseDown) {
                    return this.variableSeek * 100;
                }

                return (this.duration === 0 ? 0 : this.seek / this.duration) * 100;
            },

            repeatModeNone() { return this.repeatMode === PlayerRepeatMode.NONE; },
            repeatModeAll() { return this.repeatMode === PlayerRepeatMode.ALL; },
            repeatModeOne() { return this.repeatMode === PlayerRepeatMode.ONE; },

            controlButtonsDisabled() {
                return this.currentSong === null;
            },

            previousButtonEnabled() {
                return this.currentQueueIndex > 0 || this.seek > 5
                    || this.repeatModeAll || (this.shuffle && this.playbackHistorySize > 0);
            },

            nextButtonEnabled() {
                return this.currentQueueIndex < this.queueSize - 1 || this.repeatModeAll || this.shuffle;
            },

            queueLink() {
                return {
                    name: PageNames.QUEUE,
                };
            },
        },

        methods: {
            onVolumeMousedown() {
                this.volumeMouseDown = true;
            },

            toggleShuffle() {
                this.setShuffle(!this.shuffle);
            },

            cycleRepeatMode() {
                let mode = PlayerRepeatMode.NONE;
                mode = this.repeatMode === PlayerRepeatMode.ALL ? PlayerRepeatMode.ONE : mode;
                mode = this.repeatMode === PlayerRepeatMode.NONE ? PlayerRepeatMode.ALL : mode;

                this.setRepeatMode(mode);
            },

            toggleMute() {
                this.setMuted(!this.muted);
            },

            onSeekerMousedown() {
                if (this.duration > 0) {
                    this.seekerMouseDown = true;
                }
            },

            calculatePercentage(xPos, element) {
                return Math.min(1,
                    Math.max(0, (xPos - element.getBoundingClientRect().left) / element.scrollWidth),
                );
            },

            onMouseMove(event) {
                if (this.seekerMouseDown === true && this.duration > 0) {
                    const { seekerElement } = this.$refs;
                    this.variableSeek = this.calculatePercentage(event.clientX, seekerElement);
                }

                if (this.volumeMouseDown === true) {
                    const { volumeElement } = this.$refs;
                    this.setVolume(this.calculatePercentage(event.clientX, volumeElement));
                }
            },

            onMouseUp(event) {
                if (this.seekerMouseDown === true) {
                    this.seekerMouseDown = false;
                    this.variableSeek = 0;

                    const { seekerElement } = this.$refs;
                    this.setSeek(this.calculatePercentage(event.clientX, seekerElement) * this.duration);
                }

                if (this.volumeMouseDown === true) {
                    this.volumeMouseDown = false;
                    const { volumeElement } = this.$refs;
                    this.setVolume(this.calculatePercentage(event.clientX, volumeElement));
                }
            },
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./PlayerControls.scss" lang="scss"></style>
