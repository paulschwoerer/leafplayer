<template>
    <DefaultModal class="component-edit-playlist-modal">
        <h2 class="modal-headline">Edit playlist.</h2>

        <ValidationForm
            :value="formValues"
            :fields="formFields"
            submitLabel="Save"
            :onSubmit="handlePlaylistUpdate"
        />
    </DefaultModal>
</template>

<script>
    import { mapActions } from 'vuex';
    import Button from 'components/form/Button';
    import { MediaNamespace } from 'store/modules/media';
    import DefaultModal from 'components/modal/DefaultModal';
    import ValidationForm from 'components/form/ValidationForm';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentEditPlaylistModal',

        props: {
            playlist: LeafPlayerPropTypes.playlist.isRequired,
        },

        data() {
            const { name, description } = this.playlist;

            return {
                formValues: {
                    playlistName: name,

                    playlistDescription: description || '',

                    playlistPrivate: this.playlist.private,
                },
            };
        },

        computed: {
            formFields() {
                return [
                    {
                        name: 'playlistName',
                        type: 'text',
                        label: 'Update the name of the playlist',
                        required: true,
                    },
                    {
                        name: 'playlistDescription',
                        type: 'textarea',
                        label: 'Change the description of the playlist',
                        required: false,
                    },
                    {
                        name: 'playlistPrivate',
                        type: 'checkbox',
                        label: 'Make Playlist private',
                    },
                ];
            },
        },

        methods: {
            ...mapActions({
                closeModal: 'modal/closeModal',
                savePlaylist: `${MediaNamespace}/savePlaylist`,
            }),

            handlePlaylistUpdate() {
                return this.savePlaylist({
                    id: this.playlist.id,
                    isPrivate: this.formValues.playlistPrivate,
                    name: this.formValues.playlistName,
                    description: this.formValues.playlistDescription,
                }).then(this.closeModal);
            },
        },

        components: {
            Button,
            DefaultModal,
            ValidationForm,
        },
    };
</script>

<style src="./EditPlaylistModal.scss" lang="scss"></style>
