<template>
    <div class="component-search-input">
        <form @submit.prevent="handleSubmit">
            <Input label="Search collection" :value="searchQuery" @input="handleInputChange" :autofocus="autofocus" :variation="variation"/>
        </form>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import VueTypes from 'vue-types';
    import Params from 'data/enum/Params';
    import Input from 'components/form/Input';
    import PageNames from 'data/enum/PageNames';

    export default {
        name: 'ComponentSearchInput',

        props: {
            autofocus: VueTypes.bool.def(false),

            variation: VueTypes.oneOf(['light', 'dark']).def('dark'),
        },

        watch: {
            searchQuery(val) {
                const value = val || '';

                if (this.route.params[Params.SEARCH_QUERY] !== value) {
                    const options = {
                        name: 'search',
                        params: value.length > 0 ? {
                            [Params.SEARCH_QUERY]: value,
                        } : {},
                    };

                    if (this.route.name === PageNames.SEARCH) {
                        this.$router.replace(options);
                    } else {
                        this.$router.push(options);
                    }
                }
            },

            route(value) {
                const query = value.params[Params.SEARCH_QUERY] || '';

                if (value.name === PageNames.SEARCH && this.searchQuery !== query) {
                    this.setSearchQuery({ query });
                }
            },
        },

        computed: mapState({
            searchQuery: state => state.search.searchQuery,

            route: state => state.route,
        }),

        methods: {
            ...mapActions('search', {
                setSearchQuery: 'setQuery',
            }),

            handleInputChange(event) {
                this.setSearchQuery({ query: event || '' });
            },

            handleSubmit() {
                if (this.route.name !== PageNames.SEARCH && this.searchQuery.length) {
                    this.$router.push({
                        name: 'search',
                        params: this.searchQuery.length > 0 ? {
                            [Params.SEARCH_QUERY]: this.searchQuery,
                        } : {},
                    });
                }
            },
        },

        components: {
            Input,
        },
    };
</script>

<style src="./SearchInput.scss" lang="scss"></style>
