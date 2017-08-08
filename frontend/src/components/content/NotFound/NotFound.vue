<template>
    <div class="component-not-found">
        <Header>
            <h1>Oh, snap!</h1>
        </Header>

        <ContentWrapper>
            <ContentNotification :icon="icon">
                <slot />
            </ContentNotification>
        </ContentWrapper>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Header from 'components/content/Header';
    import ContentWrapper from 'components/content/ContentWrapper';
    import ContentNotification from 'components/content/ContentNotification';

    export default {
        name: 'ComponentNotFound',

        props: {
            icon: VueTypes.string.def('sentiment_dissatisfied'),
        },

        components: {
            Header,
            ContentWrapper,
            ContentNotification,
        },
    };
</script>

<style src="./NotFound.scss" lang="scss"></style>
