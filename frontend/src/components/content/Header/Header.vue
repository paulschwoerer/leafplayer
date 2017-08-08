<template>
    <div class="component-header">
        <HamburgerButton :onClick="toggleSideBar" />

        <div class="header-content">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import HamburgerButton from 'components/navigation/HamburgerButton';

    export default {
        name: 'ComponentHeader',

        methods: {
            ...mapActions({
                toggleSideBar: 'toggleSideBar',
            }),
        },

        components: {
            HamburgerButton,
        },
    };
</script>

<style src="./Header.scss" lang="scss"></style>
