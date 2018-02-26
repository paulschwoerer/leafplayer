<template>
    <div class="component-button" :class="[{ disabled, loading: isLoading }, variation]">
        <button @click="handleClick">
            <div class="contents">
                <slot />
            </div>
            <Spinner class="spinner" :variation="spinnerVariation" size="sm" />
        </button>

        <div class="overlay-disabled" v-if="disabled" />
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Spinner from 'components/Spinner';
    import Icon from 'components/content/Icon';

    export default {
        name: 'ComponentButton',

        props: {
            // color variation of the button
            variation: VueTypes.oneOf(['blue', 'red', 'white', 'white-border']).def('blue'),

            // disable the button from the outside
            disabled: VueTypes.bool.def(false),

            // set the loading state from the outside
            loading: VueTypes.bool.def(false),

            // callback once the button is clicked
            onClick: VueTypes.func,

            // type: VueTypes.string.def()
        },

        data() {
            return {
                busy: false,
            };
        },

        computed: {
            isLoading() {
                return this.busy || this.loading;
            },

            spinnerVariation() {
                switch (this.variation) {
                    case 'white':
                        return 'dark';
                    case 'blue':
                    case 'red':
                    default:
                        return 'light';
                }
            },
        },

        methods: {
            handleClick(event) {
                const promise = this.onClick(event);

                if (!!promise && typeof promise.then === 'function') {
                    this.busy = true;

                    promise.then(this.onCallbackFinished).catch(this.onCallbackFinished);
                }
            },

            onCallbackFinished() {
                this.busy = false;
            },
        },

        components: {
            Icon,
            Spinner,
        },
    };
</script>

<style src="./Button.scss" lang="scss"></style>
