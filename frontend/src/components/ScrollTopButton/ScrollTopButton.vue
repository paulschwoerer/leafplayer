<template>
    <transition name="fade">
        <div class="component-scroll-top-button" title="Back to top" @click="onClicked" v-show="show">
            <Icon name="chevron_left" />
        </div>
    </transition>
</template>

<script>
    import VueTypes from 'vue-types';
    import Icon from 'components/content/Icon';
    import { easeInOutQuad } from 'utils/timeUtils';
    import debounce from 'throttle-debounce/debounce';

    export default {
        name: 'ComponentScrollTopButton',

        props: {
            scrollDistance: VueTypes.number.def(600),

            scrollDuration: VueTypes.number.def(500),
        },

        data() {
            return {
                show: false,

                startTime: 0,

                startPosition: 0,
            };
        },

        mounted() {
            window.addEventListener('scroll', debounce(250, this.onScroll));
            this.onScroll();
        },

        methods: {
            onClicked() {
                this.startPosition = this.getWindowOffset();
                this.startTime = new Date().getTime();

                requestAnimationFrame(this.animate);
            },

            animate() {
                const time = new Date().getTime();
                const value = this.startPosition - (easeInOutQuad((time - this.startTime)
                        / this.scrollDuration) * this.startPosition);

                if (value > 5) {
                    window.scrollTo(0, value);
                    requestAnimationFrame(this.animate);
                } else {
                    window.scrollTo(0, 0);
                }
            },

            onScroll() {
                this.show = this.getWindowOffset() > this.scrollDistance;
            },

            getWindowOffset() {
                return window.pageYOffset || document.documentElement.scrollTop;
            },
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./ScrollTopButton.scss" lang="scss"></style>
