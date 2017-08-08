<template>
    <div class="component-header-info-item">
        <Icon :name="icon"/>
        <p>{{value}}</p>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Icon from 'components/content/Icon';

    export default {
        name: 'ComponentHeaderInfoItem',

        props: {
            icon: VueTypes.string.isRequired,
            value: VueTypes.string.isRequired,
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./HeaderInfoItem.scss" lang="scss"></style>
