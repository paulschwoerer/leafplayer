<template>
    <div class="component-playing-indicator" :class="[size, variation]">
        <div class="bars">
            <div class="bar bar1" ></div>
            <div class="bar bar2"></div>
            <div class="bar bar3"></div>
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';

    export default {
        name: 'ComponentPlayingIndicator',

        props: {
            size: VueTypes.oneOf(['sm', 'md', 'lg']).def('md'),
            variation: VueTypes.oneOf(['light', 'dark']).def('light'),
        },
    };
</script>

<style src="./PlayingIndicator.scss" lang="scss"></style>
