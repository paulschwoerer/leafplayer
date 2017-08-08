<template>
    <div class="route-queue">
        <QueueHeader :songCount="songIds.length" :totalDuration="totalDuration" />
        <ContentWrapper>
            <SongList
                v-if="songIds.length"
                :songIds="songIds"
                :onSongDropped="handleSongMove"
                :onSongPlay="handleSongPlay"
                showAlbum
                showArtist
                showIndex
                allowSongSorting
                isQueue
                :onRemoveFromQueue="handleQueueRemove"
            />

            <ContentNotification icon="queue" v-else>
                Queue is currently empty, add some songs by dropping onto the player.
            </ContentNotification>
        </ContentWrapper>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import EventBus from 'store/eventbus';
    import { timeString } from 'utils/timeUtils';
    import SongList from 'components/media/SongList';
    import { setQueueFromSongs } from 'utils/mediaUtils';
    import { PlayerNamespace } from 'store/modules/player';
    import QueueHeader from 'components/media/QueueHeader';
    import ContentWrapper from 'components/content/ContentWrapper';
    import ContentNotification from 'components/content/ContentNotification';

    export default {
        name: 'RouteQueue',

        computed: {
            ...mapGetters(PlayerNamespace, {
                songs: 'queueSongs',
            }),

            songIds() {
                return this.songs.map(song => song.id);
            },

            totalDuration() {
                let totalDuration = 0;

                this.songs.forEach((song) => {
                    totalDuration += song.duration;
                });

                return timeString(totalDuration);
            },
        },

        methods: {
            handleSongMove(fromIndex, toIndex) {
                EventBus.$emit('player:moveQueueItem', { fromIndex, toIndex });
            },

            handleQueueRemove(index) {
                EventBus.$emit('player:removeFromQueue', { index });
            },

            handleSongPlay(songIds, songId) {
                setQueueFromSongs(songIds, songId, true);
            },
        },

        components: {
            SongList,
            QueueHeader,
            ContentWrapper,
            ContentNotification,
        },
    };
</script>

<style src="./Queue.scss" lang="scss"></style>
