<template>
    <li class="component-side-bar-create-playlist has-icon" @click.prevent="handleCreateNewPlaylistClicked">
        <Icon name="add"/>
        <a href="#">{{label}}</a>
    </li>
</template>

<script>
    import VueTypes from 'vue-types';
    import { mapActions } from 'vuex';
    import Icon from 'components/content/Icon';
    import CreatePlaylistModal from 'components/modal/CreatePlaylistModal';

    export default {
        name: 'ComponentSideBarCreatePlaylist',

        props: {
            isOver: VueTypes.bool.isRequired,
        },

        computed: {
            label() {
                return `Create Playlist${this.isOver ? ' from songs' : ''}`;
            },
        },

        methods: {
            ...mapActions({
                openModal: 'modal/openModal',
            }),

            handleCreateNewPlaylistClicked() {
                return this.openModal({ component: CreatePlaylistModal });
            },
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./SideBarCreatePlaylist.scss" lang="scss"></style>
