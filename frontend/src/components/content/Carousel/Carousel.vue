<template>
    <div class="component-carousel">
        <div class="carousel-viewport">
            <div class="carousel-track" :style="trackStyle">
                <slot></slot>
            </div>

            <div class="button next" :class="{ visible: hasNext }" @click.prevent="next"><Icon name="arrow_forward" /></div>
            <div class="button previous" :class="{ visible: hasPrevious }" @click.prevent="previous"><Icon name="arrow_back" /></div>
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import { clamp } from 'utils/mathUtils';
    import Icon from 'components/content/Icon';

    export default {
        name: 'ComponentCarousel',

        props: {
            onLastSlide: VueTypes.func,
        },

        data() {
            return {
                offset: 0,

                trackWidth: 0,
                viewportWidth: 0,
                childrenWidth: 0,
            };
        },

        mounted() {
            this.updateValues();

            window.addEventListener('resize', this.updateValues);
        },

        beforeDestroy() {
            window.removeEventListener('resize', this.updateValues);
        },

        computed: {
            trackStyle() {
                return {
                    transform: `translateX(${-this.offset}px)`,
                };
            },

            hasPrevious() {
                return this.offset > 0;
            },

            hasNext() {
                return this.offset < (this.trackWidth - this.viewportWidth);
            },
        },

        methods: {
            updateValues() {
                // this assumes, that every child is the same width
                this.childrenWidth = this.$children[0] ? this.$children[0].$el.clientWidth : 0;

                this.viewportWidth = this.$el.childNodes[0].clientWidth;

                this.trackWidth = this.$children.length * this.childrenWidth;
            },

            next() {
                this.setOffset(this.offset + (Math.floor(this.viewportWidth / this.childrenWidth) * this.childrenWidth));

                if (!this.hasNext) {
                    this.onLastSlide();
                }
            },

            previous() {
                this.setOffset(this.offset - (Math.floor(this.viewportWidth / this.childrenWidth) * this.childrenWidth));
            },

            setOffset(value) {
                this.offset = clamp(value, 0, this.trackWidth - this.viewportWidth);
            },
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./Carousel.scss" lang="scss"></style>
