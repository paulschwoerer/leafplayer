<template>
    <div class="component-artist-card">
        <router-link :to="artistLink" :title="artist.name">
            <Card :caption="artist.name" details="Cool Artist info" icon="album" :iconDetail="albumCount">
                <img src="../../../assets/img/artist-default.jpg">
            </Card>
        </router-link>
    </div>
</template>

<script>
    import Params from 'data/enum/Params';
    import Card from 'components/content/Card';
    import PageNames from 'data/enum/PageNames';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentArtistCard',

        props: {
            artist: LeafPlayerPropTypes.artist.isRequired,
        },

        computed: {
            albumCount() {
                const { albumCount } = this.artist;

                return albumCount.toString();
            },

            artistLink() {
                return {
                    name: PageNames.ARTIST,
                    params: { [Params.ARTIST_ID]: this.artist.id },
                };
            },
        },

        components: {
            Card,
        },
    };
</script>

<style src="./ArtistCard.scss" lang="scss"></style>
