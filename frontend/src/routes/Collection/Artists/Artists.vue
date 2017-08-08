<template>
    <div class="route-collection-artists">
        <transition name="fade">
            <ContentNotification v-if="totalArtists === 0" icon="person">
                There are no artists in this collection.
                <Button :onClick="loadMoreArtists" variation="white">Refresh</Button>
            </ContentNotification>
        </transition>

        <Waterfall>
            <ArtistCard v-for="artist in artistCollection" :key="artist.id" :artist="artist" />
        </Waterfall>

        <transition name="fade">
            <InfiniteLoader :loadMoreItems="loadMoreArtists" :finishedLoading="isFinishedLoading" />
        </transition>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import Button from 'components/form/Button';
    import ModelType from 'data/enum/ModelType';
    import { sortByPropertyCI } from 'utils/arrayUtils';
    import ArtistCard from 'components/media/ArtistCard';
    import Waterfall from 'components/content/Waterfall';
    import { MediaNamespace } from 'store/modules/media';
    import { getAllModelsOfType } from 'utils/modelUtils';
    import InfiniteLoader from 'components/InfiniteLoader';
    import ContentNotification from 'components/content/ContentNotification';

    export default {
        name: 'RouteCollectionArtists',

        computed: {
            ...mapState(MediaNamespace, {
                artistOffset: state => state.artistOffset,
                totalArtists: state => state.totalArtists,
            }),

            /**
             * Get all artists, sorted by their name.
             *
             * @returns {Array}
             */
            artistCollection() {
                return getAllModelsOfType(ModelType.ARTIST).sort(sortByPropertyCI('name'));
            },

            isFinishedLoading() {
                return !isNaN(this.totalArtists) && (this.artistOffset >= this.totalArtists);
            },
        },

        methods: {
            ...mapActions(MediaNamespace, {
                loadArtists: 'loadArtists',
            }),

            loadMoreArtists() {
                return this.loadArtists({
                    offset: this.artistOffset,
                    take: 40,
                });
            },
        },

        components: {
            Button,
            Waterfall,
            ArtistCard,
            InfiniteLoader,
            ContentNotification,
        },
    };
</script>

<style src="./Artists.scss" lang="scss"></style>
