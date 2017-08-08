<template>
    <div class="route-administration-users">
        <UserList />
    </div>
</template>

<script>
    import UserList from 'components/administration/UserList';

    export default {
        name: 'RouteAdministrationUsers',

        components: {
            UserList,
        },
    };
</script>

<style src="./Users.scss" lang="scss"></style>
