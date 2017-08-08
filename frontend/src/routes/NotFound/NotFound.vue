<template>
    <div class="route-not-found">
        <NotFound>
            The page you are looking for was not found.
        </NotFound>
    </div>
</template>

<script>
    import NotFound from 'components/content/NotFound';

    export default {
        name: 'RouteNotFound',

        components: {
            NotFound,
        },
    };
</script>

<style src="./NotFound.scss" lang="scss"></style>
