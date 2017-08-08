<template>
    <div class="component-spinner" :class="[size, variation]">
        <svg>
            <circle cx="50%" cy="50%" r="33.33%"></circle>
        </svg>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';

    export default {
        name: 'ComponentSpinner',

        props: {
            size: VueTypes.oneOf(['sm', 'md', 'lg']).def('md'),
            variation: VueTypes.oneOf(['light', 'dark']).def('dark'),
        },
    };
</script>

<style src="./Spinner.scss" lang="scss"></style>
