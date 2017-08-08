<template>
    <DefaultModal class="component-create-playlist-modal">
        <!--<div class="add-image">-->
            <!--<img src="../../../assets/img/playlist-default.jpg" alt="">-->

            <!--<div class="hover-overlay">-->
                <!--<input type="file" accept="image/jpeg" @change="handleFileInputChange" id="playlist_add_image_input" />-->
                <!--<label for="playlist_add_image_input">-->
                    <!--<Icon name="photo_camera" />-->
                    <!--<span>Add photo</span>-->
                <!--</label>-->
            <!--</div>-->
        <!--</div>-->

        <h2 class="modal-headline" v-if="songIdsToAdd.length > 0">Create a new playlist from {{songIdsToAdd.length}} song(s).</h2>
        <h2 class="modal-headline" v-else>Create a new playlist.</h2>

        <ValidationForm
            :value="formValues"
            :fields="formFields"
            submitLabel="Create"
            :onSubmit="handlePlaylistCreation"
        />
    </DefaultModal>
</template>

<script>
    import VueTypes from 'vue-types';
    import { mapActions } from 'vuex';
    import Params from 'data/enum/Params';
    import Input from 'components/form/Input';
    import Icon from 'components/content/Icon';
    import PageNames from 'data/enum/PageNames';
    import CheckBox from 'components/form/CheckBox';
    import { ModalNamespace } from 'store/modules/modal';
    import { MediaNamespace } from 'store/modules/media';
    import DefaultModal from 'components/modal/DefaultModal';
    import ValidationForm from 'components/form/ValidationForm';
    import { showFailNotification } from 'utils/notificationUtils';

    export default {
        name: 'ComponentCreatePlaylistModal',

        props: {
            songIdsToAdd: VueTypes.arrayOf(VueTypes.string).def([]),
        },

        data() {
            return {
                formValues: {
                    playlistName: '',

                    playlistDescription: '',

                    playlistPrivate: true,
                },
            };
        },

        computed: {
            formFields() {
                return [
                    {
                        name: 'playlistName',
                        type: 'text',
                        label: 'Enter a name for the Playlist',
                        required: true,
                    },
                    {
                        name: 'playlistDescription',
                        type: 'textarea',
                        label: 'Add an optional description',
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
                createPlaylist: `${MediaNamespace}/createPlaylist`,

                closeModal: `${ModalNamespace}/closeModal`,
            }),

            handleFileInputChange(event) {
                // TODO
            },

            handlePlaylistCreation() {
                return this.createPlaylist({
                    isPrivate: this.formValues.playlistPrivate,
                    name: this.formValues.playlistName,
                    description: this.formValues.playlistDescription,
                    songIds: this.songIdsToAdd,
                }).then(({ id }) => {
                    this.closeModal();

                    this.$router.push({
                        name: PageNames.PLAYLIST,
                        params: {
                            [Params.PLAYLIST_ID]: id,
                        },
                    });
                }).catch(() => showFailNotification('Error while creating playlist.'));
            },
        },

        components: {
            Icon,
            Input,
            CheckBox,
            DefaultModal,
            ValidationForm,
        },
    };
</script>

<style src="./CreatePlaylistModal.scss" lang="scss"></style>
