<template>
    <DefaultModal class="component-{{name_sc}}">
        <h2 class="modal-headline">{{name_pc}}</h2>

        <div class="modal-text">
            <p>Example modal text</p>
        </div>


        <div class="modal-buttons">
            <Button variation="white" :onClick="closeModal" >Cancel</Button>
            <Button variation="blue" :onClick="handleConfirmation" >Confirm</Button>
        </div>
    </DefaultModal>
</template>

<script>
    import VueTypes from 'vue-types';
    import { mapActions } from 'vuex';
    import Button from 'components/form/Button';
    import DefaultModal from 'components/modal/DefaultModal';

    export default {
        name: 'Component{{name_pc}}',

        props: {

        },

        data() {
            return {};
        },

        methods: {
            ...mapActions({
                closeModal: 'modal/closeModal',
            }),

            handleConfirmation() {

            },
        },

        components: {
            Button,
            DefaultModal,
        },
    };
</script>

<style src="./{{name_pc}}.scss" lang="scss"></style>
