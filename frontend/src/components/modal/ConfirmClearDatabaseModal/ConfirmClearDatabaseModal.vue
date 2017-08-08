<template>
    <DefaultModal class="component-confirm-clear-database-modal">
        <h2 class="modal-headline">Confirm clearing the database</h2>

        <div class="modal-text">
            <p>Are you sure you want to clear the database? This will wipe all media info, ratings and playlists. The whole media collection will need rebuilding.</p>
        </div>

        <Input label="Type 'yes' to clear the database" v-model="confirmation" />

        <div class="modal-buttons">
            <Button variation="red" :disabled="!isConfirmed" :onClick="handleDatabaseDeletion">Delete everything</Button>
            <Button variation="blue" :onClick="closeModal">Get me out of here!</Button>
        </div>
    </DefaultModal>
</template>

<script>
    import { mapActions } from 'vuex';
    import Input from 'components/form/Input';
    import Button from 'components/form/Button';
    import DefaultModal from 'components/modal/DefaultModal';

    export default {
        name: 'ComponentConfirmClearDatabaseModal',

        data() {
            return {
                confirmation: '',
            };
        },

        computed: {
            isConfirmed() {
                return this.confirmation.toLowerCase() === 'yes';
            },
        },

        methods: {
            ...mapActions({
                closeModal: 'modal/closeModal',

                clearCollection: 'administration/clearCollection',
            }),

            handleDatabaseDeletion() {
                return this.clearCollection().then(this.closeModal);
            },
        },

        components: {
            Input,
            Button,
            DefaultModal,
        },
    };
</script>

<style src="./ConfirmClearDatabaseModal.scss" lang="scss"></style>
