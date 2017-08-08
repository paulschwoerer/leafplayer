<template>
    <div class="component-content-notification">
        <Icon :name="icon" />

        <div class="message">
            <slot />
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Icon from 'components/content/Icon';

    export default {
        name: 'ComponentContentNotification',

        props: {
            icon: VueTypes.string.def('sentiment_dissatisfied'),
        },

        data() {
            return {};
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./ContentNotification.scss" lang="scss"></style>
