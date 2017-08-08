<template>
    <li class="component-side-bar-playlist-link has-icon" :class="{ 'is-over': isOver }">
        <Icon :name="isOver ? 'playlist_add' : 'playlist_play'"/>
        <router-link :to="playlistLink">{{isOver ? 'Add to playlist' : playlist.name}}</router-link>
    </li>
</template>

<script>
    import VueTypes from 'vue-types';
    import Params from 'data/enum/Params';
    import Icon from 'components/content/Icon';
    import PageNames from 'data/enum/PageNames';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentSideBarPlaylistLink',

        props: {
            playlist: LeafPlayerPropTypes.playlist.isRequired,

            isOver: VueTypes.bool.isRequired,
        },

        computed: {
            playlistLink() {
                return {
                    name: PageNames.PLAYLIST,
                    params: { [Params.PLAYLIST_ID]: this.playlist.id },
                };
            },
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./SideBarPlaylistLink.scss" lang="scss"></style>
