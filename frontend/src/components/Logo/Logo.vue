<template>
    <div class="component-logo">
        <router-link :to="homeLink">
            <img src="../../assets/svg/leafplayer-logo.svg" alt="Leafplayer logo">
            <h1 class="name">LeafPlayer</h1>
        </router-link>
    </div>
</template>

<script>
    import PageNames from 'data/enum/PageNames';

    export default {
        name: 'ComponentLogo',

        computed: {
            homeLink() {
                return {
                    name: PageNames.HOME,
                };
            },
        },
    };
</script>

<style src="./Logo.scss" lang="scss"></style>
