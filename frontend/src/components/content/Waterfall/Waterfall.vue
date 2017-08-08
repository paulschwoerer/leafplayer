<template>
    <div class="component-waterfall">
        <slot></slot>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import debounce from 'throttle-debounce/debounce';
    import throttle from 'throttle-debounce/throttle';

    export default {
        name: 'ComponentWaterfall',
    };
</script>

<style src="./Waterfall.scss" lang="scss"></style>
