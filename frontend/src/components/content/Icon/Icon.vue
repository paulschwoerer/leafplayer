<template>
    <i class="component-icon material-icons" @click="onClick">{{name}}</i>
</template>

<script>
    import VueTypes from 'vue-types';

    export default {
        name: 'ComponentIcon',

        props: {
            name: VueTypes.string.isRequired,

            onClick: VueTypes.func,
        },
    };
</script>

<style src="./Icon.scss" lang="scss"></style>
