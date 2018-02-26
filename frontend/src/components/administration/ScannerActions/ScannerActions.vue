<template>
    <div class="component-scanner-actions">
        <Button :disabled="scanRunning" :onClick="scanCollection">Start New Scan</Button>
        <p>Add new media to your collection or refresh old.</p>
        <div class="seperator"></div>
        <Button :disabled="scanRunning" :onClick="cleanCollection">Clean Up Library</Button>
        <p>Remove missing files from the collection.</p>
        <div class="seperator"></div>
        <Button :disabled="scanRunning" icon="delete" variation="red" :onClick="confirmWipe">Wipe Library</Button>
        <p>Clear the database.</p>
        <p class="text-danger">Use with care!</p>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import VueTypes from 'vue-types';
    import Button from 'components/form/Button';
    import ConfirmWipeLibraryModal from 'components/modal/ConfirmWipeLibraryModal';

    export default {
        name: 'ComponentScannerActions',

        props: {
            scanRunning: VueTypes.bool.isRequired,
            scanCollection: VueTypes.func.isRequired,
            cleanCollection: VueTypes.func.isRequired,
            wipeCollection: VueTypes.func.isRequired,
        },

        methods: {
            ...mapActions({
                openModal: 'modal/openModal',
            }),

            confirmWipe() {
                return this.openModal({
                    component: ConfirmWipeLibraryModal,
                    props: {
                        onConfirm: this.wipeCollection,
                    },
                });
            },
        },

        components: {
            Button,
        },
    };
</script>

<style src="./ScannerActions.scss" lang="scss"></style>
