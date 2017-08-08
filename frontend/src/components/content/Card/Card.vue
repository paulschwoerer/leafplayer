<template>
    <div class="component-card">
        <div class="art-container">
            <div class="art">
                <slot></slot>
            </div>
        </div>
        <div class="main">
            <div class="caption">
                <p class="ellipsis" :title="caption">{{caption}}</p>
            </div>
            <div class="details ellipsis" v-if="details.length">
                <small :title="details">{{details}}</small>
            </div>
            <div class="icon" v-if="icon.length">
                <Icon :name="icon"/>
                <small v-if="iconDetail.length">{{iconDetail}}</small>
            </div>
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Icon from 'components/content/Icon';

    export default {
        name: 'ComponentCard',

        props: {
            caption: VueTypes.string.isRequired,
            details: VueTypes.string.def(''),
            icon: VueTypes.string.def(''),
            iconDetail: VueTypes.string.def(''),
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./Card.scss" lang="scss"></style>
