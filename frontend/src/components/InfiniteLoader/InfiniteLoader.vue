<template>
    <div class="component-infinite-loader">
        <div class="busy" v-show="busy">
            <Spinner :size="loaderSize" :variation="loaderVariation"></Spinner>
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Spinner from 'components/Spinner';
    import { assert } from 'utils/debugUtils';
    import debounce from 'throttle-debounce/debounce';

    /**
     * Get first scrollable parent of an element.
     * Credit: https://github.com/PeachScript
     *
     * @param element
     * @returns {*}
     */
    const getScrollContainer = (element) => {
        if (element.tagName.toLowerCase() === 'body') {
            return window;
        } else if (['scroll', 'auto'].indexOf(getComputedStyle(element).overflowY) > -1) {
            return element;
        }

        return getScrollContainer(element.parentNode);
    };

    /**
     * Get scroll distance.
     *
     * @param container
     * @param element
     * @returns {number}
     */
    const getScrollDistance = (container, element) => {
        const elementScroll = element.getBoundingClientRect().top;
        const containerScroll = container === window ?
            window.innerHeight : container.getBoundingClientRect().bottom;

        return elementScroll - containerScroll;
    };


    export default {
        name: 'ComponentInfiniteLoader',

        props: {
            // distance from bottom of viewport when new items should be loaded
            distance: VueTypes.number.def(200),

            // callback to load more items. Is required to return a promise,
            // so the loader knows when the loading is finished
            loadMoreItems: VueTypes.func.isRequired,

            // Tell the InfiniteLoader, that all items have been loaded
            finishedLoading: VueTypes.bool.isRequired,

            // the variation of the loader component in the infinite loader
            loaderVariation: VueTypes.oneOf(['light', 'dark']).def('dark'),

            // the size of the loader component
            loaderSize: VueTypes.oneOf(['sm', 'md', 'lg']).def('md'),
        },

        data() {
            return {
                busy: false,
            };
        },

        mounted() {
            this.scrollContainer = getScrollContainer(this.$el);

            this.scrollContainer.addEventListener('scroll', this.debounceScroll);
            this.$nextTick(this.onScroll);
        },

        beforeDestroy() {
            this.scrollContainer.removeEventListener('scroll', this.debounceScroll);
        },

        methods: {
            /* eslint-disable func-names */
            debounceScroll: debounce(100, function () {
                this.onScroll();
            }),

            /**
             * Handle scroll.
             */
            onScroll() {
                if (this.busy === false && this.finishedLoading === false) {
                    const distance = getScrollDistance(this.scrollContainer, this.$el);

                    if (distance <= this.distance) {
                        this.handleItemLoad();
                    }
                }
            },

            /**
             * Handle what happens when more items should be loaded.
             */
            handleItemLoad() {
                if (this.finishedLoading === false) {
                    this.busy = true;

                    const promise = this.loadMoreItems();

                    assert(promise && typeof promise.then === 'function',
                        '[InfiniteLoader] Load items callback has to return a valid promise.');

                    promise.then(() => {
                        this.busy = false;
                    });
                }
            },

            /**
             * Handle an error while retrieving items.
             *
             * @param error
             */
            handleErrorWhileLoadingItems(error) {
                console.warn('[InfiniteLoader] Error while loading more items: ', error);
            },
        },

        components: {
            Spinner,
        },
    };
</script>

<style src="./InfiniteLoader.scss" lang="scss"></style>
