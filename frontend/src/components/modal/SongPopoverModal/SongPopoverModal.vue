<template>
    <DefaultModal class="component-song-popover-modal" >
        <div class="grid">
            <div class="title-container">
                <h2 class="title ellipsis" :title="song.title">{{song.title}}</h2>
                <p class="artist" @click="closeModal()">
                    <Icon name="person" />
                    <router-link :to="artistLink">{{song.artist.name}}</router-link>
                </p>
            </div>

            <ul class="actions-container">
                <li><Button>Play next</Button></li>
                <li><Button>Enqueue</Button></li>
            </ul>

            <div class="add-to-playlist-container">
                <div class="playlist" v-for="playlist in playlists">

                </div>
            </div>
        </div>
    </DefaultModal>
</template>

<script>
    import Params from 'data/enum/Params';
    import Icon from 'components/content/Icon';
    import { mapActions, mapState } from 'vuex';
    import PageNames from 'data/enum/PageNames';
    import ModelType from 'data/enum/ModelType';
    import Button from 'components/form/Button';
    import { getAllModelsOfType } from 'utils/modelUtils';
    import { sortByPropertyCI } from 'utils/arrayUtils';
    import DefaultModal from 'components/modal/DefaultModal';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentSongPopoverModal',

        props: {
            song: LeafPlayerPropTypes.song.isRequired,
        },

        data() {
            return {};
        },

        computed: {
            ...mapState('auth', {
                currentUserId: state => state.userId,
            }),

            artistLink() {
                return {
                    name: PageNames.ARTIST,
                    params: { [Params.ARTIST_ID]: this.song.artist.id },
                };
            },

            playlists() {
                getAllModelsOfType(ModelType.PLAYLIST)
                    .filter(playlist => playlist.userId === this.currentUserId)
                    .sort(sortByPropertyCI('name'));
            },
        },

        methods: {
            ...mapActions({
                closeModal: 'modal/closeModal',
            }),

            handleConfirmation() {

            },
        },

        components: {
            Icon,
            Button,
            DefaultModal,
        },
    };
</script>

<style src="./SongPopoverModal.scss" lang="scss"></style>
