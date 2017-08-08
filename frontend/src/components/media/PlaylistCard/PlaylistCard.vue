<template>
    <div class="component-playlist-card">
        <Card
            :caption="playlist.name"
            :details="playlist.owner.name"
            icon="music_note"
            :iconDetail="itemCount"
        >
            <router-link :to="playlistLink" :title="playlist.name">
                <img src="../../../assets/img/playlist-default.jpg">
            </router-link>
        </Card>
    </div>
</template>

<script>
    import Params from 'data/enum/Params';
    import Card from 'components/content/Card';
    import PageNames from 'data/enum/PageNames';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentPlaylistCard',

        props: {
            playlist: LeafPlayerPropTypes.playlist.isRequired,
        },

        computed: {
            itemCount() {
                const { songCount } = this.playlist;

                return songCount.toString();
            },

            playlistLink() {
                return {
                    name: PageNames.PLAYLIST,
                    params: { [Params.PLAYLIST_ID]: this.playlist.id },
                };
            },
        },

        components: {
            Card,
        },
    };
</script>

<style src="./PlaylistCard.scss" lang="scss"></style>
