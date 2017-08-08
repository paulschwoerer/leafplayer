<template>
    <div class="component-playlist-header">
        <Header>
            <div class="name-group">
                <h1>{{playlist.name}}</h1>

                <div class="playlist-actions" v-if="canCurrentUserEditPlaylist">
                    <Icon :onClick="handlePlaylistEdit" class="edit-playlist" name="edit"/>
                    <Icon :onClick="handlePlaylistDelete" class="delete-playlist" name="delete"/>
                </div>
            </div>

            <p>
                Created by {{isCurrentUserCreatorOfPlaylist ? 'you' : playlist.owner.name}} {{creationDate}}
                <span class="description" v-if="playlist.description">&bullet; {{playlist.description}}</span>
            </p>
            <HeaderInfo>
                <HeaderInfoItem icon="music_note" :value="playlist.songCount.toString()" />
                <HeaderInfoItem icon="access_time" :value="totalDuration" />
            </HeaderInfo>
        </Header>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import Icon from 'components/content/Icon';
    import Header from 'components/content/Header';
    import HeaderInfo from 'components/content/HeaderInfo';
    import HeaderInfoItem from 'components/content/HeaderInfoItem';
    import EditPlaylistModal from 'components/modal/EditPlaylistModal';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';
    import { timeString, getHumanReadableTimePeriod } from 'utils/timeUtils';
    import ConfirmDeletePlaylistModal from 'components/modal/ConfirmDeletePlaylistModal';

    export default {
        name: 'ComponentPlaylistHeader',

        props: {
            playlist: LeafPlayerPropTypes.playlist.isRequired,
        },

        computed: {
            ...mapState({
                userId: state => state.auth.userId,
            }),

            /**
             * Get total duration of all songs in the playlist.
             *
             * @returns {string}
             */
            totalDuration() {
                return timeString(this.playlist.totalDuration, true, false);
            },

            canCurrentUserEditPlaylist() {
                return this.isCurrentUserCreatorOfPlaylist;
            },

            isCurrentUserCreatorOfPlaylist() {
                const { owner, ownerId } = this.playlist;

                return (owner ? owner.id : ownerId) === this.userId;
            },

            creationDate() {
                return getHumanReadableTimePeriod(this.playlist.createdAt);
            },
        },

        methods: {
            ...mapActions({
                savePlaylist: 'model/savePlaylist',
                deletePlaylist: 'model/deletePlaylist',
                openModal: 'modal/openModal',
            }),

            handlePlaylistEdit() {
                return this.openModal({
                    component: EditPlaylistModal,
                    props: {
                        playlist: this.playlist,
                    },
                });
            },

            handlePlaylistDelete() {
                return this.openModal({
                    component: ConfirmDeletePlaylistModal,
                    props: {
                        playlist: this.playlist,
                    },
                });
            },
        },

        components: {
            Icon,
            Header,
            HeaderInfo,
            HeaderInfoItem,
        },
    };
</script>

<style src="./PlaylistHeader.scss" lang="scss"></style>
