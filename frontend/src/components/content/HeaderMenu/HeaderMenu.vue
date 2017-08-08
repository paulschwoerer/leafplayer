<template>
    <div class="component-header-menu">
        <ul>
            <router-link v-for="item in items" :key="item.route" :to="{ name: item.route }" tag="li">
                <a>{{item.label}}</a>
            </router-link>
        </ul>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';

    export default {
        name: 'ComponentHeaderMenu',

        props: {
            items: VueTypes.arrayOf(VueTypes.shape({
                route: VueTypes.string.isRequired,
                label: VueTypes.string.isRequired,
            })).isRequired,
        },
    };
</script>

<style src="./HeaderMenu.scss" lang="scss"></style>
