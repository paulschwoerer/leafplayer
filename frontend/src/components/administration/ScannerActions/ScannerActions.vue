<template>
    <div class="component-scanner-actions">
        <Button :disabled="scanRunning" :onClick="start">Start Scan</Button>
        <p>Add new media to your collection or refresh old.</p>
        <div class="seperator"></div>
        <Button :disabled="scanRunning" :onClick="clean">Clean Up</Button>
        <p>Remove missing files from the collection.</p>
        <div class="seperator"></div>
        <Button :disabled="scanRunning" icon="delete" variation="red" :onClick="clear">Clear database</Button>
        <p>Clear the database.</p>
        <p class="text-danger">Use with care!</p>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import VueTypes from 'vue-types';
    import Button from 'components/form/Button';
    import ConfirmClearDatabaseModal from 'components/modal/ConfirmClearDatabaseModal';

    export default {
        name: 'ComponentScannerActions',

        props: {
            scanRunning: VueTypes.bool.isRequired,
            scanCollection: VueTypes.func.isRequired,
            cleanCollection: VueTypes.func.isRequired,
            clearCollection: VueTypes.func.isRequired,
        },

        data() {
            return {

            };
        },

        methods: {
            ...mapActions({
                openModal: 'modal/openModal',
            }),

            start() {
                return this.scanCollection();
            },

            clean() {
                return this.cleanCollection();
            },

            clear() {
                return this.openModal({
                    component: ConfirmClearDatabaseModal,
                });
            },
        },

        components: {
            Button,
        },
    };
</script>

<style src="./ScannerActions.scss" lang="scss"></style>
