<template>
    <DefaultModal class="component-confirm-wipe-database-modal">
        <h2 class="modal-headline">Confirm wiping the library</h2>

        <div class="modal-text">
            <p>Are you sure you want to wipe the library? This will remove all media info, ratings and playlists. The whole media collection will need rebuilding.</p>
        </div>

        <Input label="Type 'yes' to wipe the library" v-model="confirmation" />

        <div class="modal-buttons">
            <Button variation="red" :disabled="!isConfirmed" :onClick="handleConfirmation">Delete everything</Button>
            <Button variation="blue" :onClick="closeModal">Get me out of here!</Button>
        </div>
    </DefaultModal>
</template>

<script>
    import VueTypes from 'vue-types';
    import { mapActions } from 'vuex';
    import Input from 'components/form/Input';
    import Button from 'components/form/Button';
    import DefaultModal from 'components/modal/DefaultModal';

    export default {
        name: 'ComponentConfirmWipeLibraryModal',

        props: {
            onConfirm: VueTypes.func,
        },

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
            }),

            handleConfirmation() {
                const promise = this.onConfirm();

                if (promise && typeof promise.then === 'function') {
                    promise.then(this.closeModal);
                } else {
                    this.closeModal();
                }
            },
        },

        components: {
            Input,
            Button,
            DefaultModal,
        },
    };
</script>

<style src="./ConfirmWipeLibraryModal.scss" lang="scss"></style>
