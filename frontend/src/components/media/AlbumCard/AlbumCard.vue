<template>
    <div class="component-album-card">
        <router-link :to="albumLink" :title="album.name">
            <Card
                :caption="album.name"
                :details="album.artist.name"
                icon="music_note"
                :iconDetail="album.songCount.toString()"
            >
                <AlbumArt :album="album" />
            </Card>
        </router-link>
    </div>
</template>

<script>
    import Params from 'data/enum/Params';
    import Card from 'components/content/Card';
    import PageNames from 'data/enum/PageNames';
    import AlbumArt from 'components/media/AlbumArt';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentAlbumCard',

        props: {
            album: LeafPlayerPropTypes.album.isRequired,
        },

        computed: {
            albumLink() {
                return {
                    name: PageNames.ALBUM,
                    params: { [Params.ALBUM_ID]: this.album.id },
                };
            },
        },

        components: {
            Card,
            AlbumArt,
        },
    };
</script>

<style src="./AlbumCard.scss" lang="scss"></style>
