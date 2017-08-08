<template>
    <div class="component-hamburger-button" @click.prevent="onClick">
        <Icon :name="icon"/>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Icon from 'components/content/Icon';

    export default {
        name: 'ComponentHamburgerButton',

        props: {
            isActive: VueTypes.bool.def(false),

            onClick: VueTypes.func,
        },

        computed: {
            icon() {
                return this.isActive ? 'close' : 'menu';
            },
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./HamburgerButton.scss" lang="scss"></style>
