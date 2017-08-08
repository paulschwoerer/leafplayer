<template>
    <DefaultModal class="component-confirm-delete-playlist-modal">
        <h2 class="modal-headline">Delete playlist</h2>

        <div class="modal-text">
            <p>Are you sure you want to delete playlist <span class="playlist-name">{{playlist.name}}</span>?</p>
        </div>

        <div class="modal-buttons">
            <Button variation="red" :onClick="handleConfirmation" >Delete playlist</Button>
            <Button variation="blue" :onClick="closeModal" >Get me out of here</Button>
        </div>
    </DefaultModal>
</template>

<script>
    import Params from 'data/enum/Params';
    import { mapActions, mapState } from 'vuex';
    import Button from 'components/form/Button';
    import PageNames from 'data/enum/PageNames';
    import { MediaNamespace } from 'store/modules/media';
    import DefaultModal from 'components/modal/DefaultModal';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentConfirmDeletePlaylistModal',

        props: {
            playlist: LeafPlayerPropTypes.playlist.isRequired,
        },

        data() {
            return {};
        },

        computed: mapState({
            currentRoute: state => state.route,
        }),

        methods: {
            ...mapActions({
                closeModal: 'modal/closeModal',
                deletePlaylist: `${MediaNamespace}/deletePlaylist`,
            }),

            handleConfirmation() {
                return this.deletePlaylist({ id: this.playlist.id }).then(() => {
                    this.closeModal();

                    if (
                        this.currentRoute.name === PageNames.PLAYLIST &&
                        this.currentRoute.params[Params.PLAYLIST_ID] === this.playlist.id
                    ) {
                        this.$router.push({ name: PageNames.HOME });
                    }
                });
            },
        },

        components: {
            Button,
            DefaultModal,
        },
    };
</script>

<style src="./ConfirmDeletePlaylistModal.scss" lang="scss"></style>
