<template>
    <transition name="modal">
        <div class="component-default-modal" @click.stop>
            <div class="close-icon" @click="handleCloseClick">
                <Icon name="close" />
            </div>
            <div class="modal-content">
                <slot></slot>
            </div>
        </div>
    </transition>
</template>

<script>
    import { mapActions } from 'vuex';
    import Icon from 'components/content/Icon';
    import Button from 'components/form/Button';

    export default {
        name: 'ComponentDefaultModal',

        methods: {
            ...mapActions('modal', {
                closeModal: 'closeModal',
            }),

            handleCloseClick() {
                this.closeModal();
            },
        },

        components: {
            Icon,
            Button,
        },
    };
</script>

<style src="./DefaultModal.scss" lang="scss"></style>
