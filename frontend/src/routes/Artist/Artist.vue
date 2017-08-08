<template>
    <div class="route-artist">
        <template v-if="artist">
            <ArtistHeader :artist="artist" />

            <ContentWrapper>
                <div class="artist-info">

                </div>

                <div class="artist-albums" v-if="artist.albumCount">
                    <h2>Albums <span>{{artist.albumCount}}</span></h2>
                    <Carousel>
                        <AlbumCard v-for="album in albums" :key="album.id" :album="album" />
                    </Carousel>
                </div>

                <div class="artist-songs">
                    <h2>Songs <span>{{artist.songCount}}</span></h2>
                    <SongList :key="artistId" :songIds="artist.songIds" showAlbum />
                </div>
            </ContentWrapper>
        </template>

        <NotFound v-else>
            This artist does not exist.
        </NotFound>
    </div>
</template>

<script>
    import store from 'store';
    import { mapState } from 'vuex';
    import Params from 'data/enum/Params';
    import SongList from 'components/media/SongList';
    import Carousel from 'components/content/Carousel';
    import AlbumCard from 'components/media/AlbumCard';
    import NotFound from 'components/content/NotFound';
    import { MediaNamespace } from 'store/modules/media';
    import { getArtist, getAlbum } from 'utils/mediaUtils';
    import ArtistHeader from 'components/media/ArtistHeader';
    import ContentWrapper from 'components/content/ContentWrapper';

    /**
     * Handle a route change in the application i.e. handle loading the artist from the backend.
     *
     * @param to
     * @param next
     */
    const handleRouteChange = (to, next) => {
        const { [Params.ARTIST_ID]: id } = to.params;

        store.dispatch(`${MediaNamespace}/loadArtist`, id).then(next).catch(next);
    };

    export default {
        name: 'RouteArtist',

        beforeRouteEnter(to, from, next) {
            handleRouteChange(to, next);
        },

        beforeRouteUpdate(to, from, next) {
            handleRouteChange(to, next);
        },

        computed: {
            ...mapState('route', {
                artistId: state => state.params[Params.ARTIST_ID],
            }),

            /**
             * Get the artist data from the store.
             *
             * @returns object
             */
            artist() {
                return getArtist(this.artistId);
            },

            albums() {
                return this.artist.albumIds.map(getAlbum);
            },
        },

        components: {
            NotFound,
            Carousel,
            SongList,
            AlbumCard,
            ArtistHeader,
            ContentWrapper,
        },
    };
</script>

<style src="./Artist.scss" lang="scss"></style>
