<template>
    <div class="route-favorites">
        <Header>
            <h1>Favorites</h1>
            <p>Here you'll find the music you love.</p>
        </Header>
        <ContentWrapper>
            <ContentNotification icon="favorite_border">
                Favorites to come soon ...
            </ContentNotification>
        </ContentWrapper>
    </div>
</template>

<script>
    import Header from 'components/content/Header';
    import ContentWrapper from 'components/content/ContentWrapper';
    import ContentNotification from 'components/content/ContentNotification';

    export default {
        name: 'RouteFavorites',

        data() {
            return {

            };
        },

        components: {
            Header,
            ContentWrapper,
            ContentNotification,
        },
    };
</script>

<style src="./Favorites.scss" lang="scss"></style>
