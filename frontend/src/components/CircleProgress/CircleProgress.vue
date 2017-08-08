<template>
    <div class="component-circle-progress" :style="mainStyle">
        <div class="circle">
            <div class="mask full" :style="maskRot">
                <div class="fill" :style="fill"></div>
            </div>
            <div class="mask half" :style="mask">
                <div class="fill" :style="fill"></div>
                <div class="fill fix" :style="fillFix"></div>
            </div>
        </div>
        <div class="inset" :style="insetStyle">
            <div class="percentage">
                <span>{{progress}}%</span>
            </div>
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';

    export default {
        name: 'ComponentCircleProgress',

        props: {
            progress: VueTypes.number.isRequired,
            transitionDuration: VueTypes.number.def(0.35),
            size: VueTypes.number.def(140),
        },

        computed: {
            mainStyle() {
                return {
                    width: `${this.size}px`,
                    height: `${this.size}px`,
                };
            },

            insetStyle() {
                return {
                    width: `${(this.size - 20)}px`,
                    height: `${(this.size - 20)}px`,
                };
            },

            maskRot() {
                return {
                    transform: `rotate(${1.8 * this.progress}deg)`,
                    clip: `rect(0, ${this.size}px, ${this.size}px, ${this.size / 2}px)`,
                };
            },

            mask() {
                return {
                    clip: `rect(0, ${this.size}px, ${this.size}px, ${this.size / 2}px)`,
                };
            },

            fill() {
                return {
                    transform: `rotate(${1.8 * this.progress}deg)`,
                    clip: `rect(0, ${this.size / 2}px, ${this.size}px, 0)`,
                    background: this.color,
                };
            },

            fillFix() {
                return {
                    transform: `rotate(${3.6 * this.progress}deg)`,
                    clip: `rect(0, ${this.size / 2}px, ${this.size}px, 0)`,
                    background: this.color,
                };
            },
        },
    };
</script>

<style src="./CircleProgress.scss" lang="scss"></style>
