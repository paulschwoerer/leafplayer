<template>
    <DefaultModal class="component-confirm-delete-user-modal">
        <h2 class="modal-headline">Delete user</h2>

        <div class="modal-text">
            <p>This will delete all of the user's playlists and ratings and cannot be undone.</p>
            <p>Are you still sure you want to delete user <span>{{user.name}}</span>?</p>
        </div>


        <div class="modal-buttons">
            <Button variation="red" :onClick="handleUserDeletion">Yes</Button>
            <Button variation="white" :onClick="closeModal">No</Button>
        </div>
    </DefaultModal>
</template>

<script>
    import { mapActions } from 'vuex';
    import Button from 'components/form/Button';
    import DefaultModal from 'components/modal/DefaultModal';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentConfirmDeleteUserModal',

        props: {
            user: LeafPlayerPropTypes.user.isRequired,
        },

        methods: {
            ...mapActions({
                deleteUser: 'administration/deleteUser',

                closeModal: 'modal/closeModal',
            }),

            handleUserDeletion() {
                this.deleteUser({
                    id: this.user.id,
                }).then(this.closeModal);
            },
        },

        components: {
            Button,
            DefaultModal,
        },
    };
</script>

<style src="./ConfirmDeleteUserModal.scss" lang="scss"></style>
