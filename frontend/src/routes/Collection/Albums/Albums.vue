<template>
    <div class="route-collection-albums">
        <transition name="fade">
            <ContentNotification v-if="totalAlbums === 0" icon="album">
                There are no albums in this collection.

                <Button :onClick="loadMoreAlbums" variation="white">Refresh</Button>
            </ContentNotification>
        </transition>

        <Waterfall>
            <AlbumCard v-for="album in albumCollection" :key="album.id" :album="album" />
        </Waterfall>

        <transition name="fade">
            <InfiniteLoader :loadMoreItems="loadMoreAlbums" :finishedLoading="isFinishedLoading" />
        </transition>
    </div>
</template>

<script>
    import { mapActions, mapState } from 'vuex';
    import ModelType from 'data/enum/ModelType';
    import Button from 'components/form/Button';
    import { parseAlbum } from 'utils/mediaUtils';
    import AlbumCard from 'components/media/AlbumCard';
    import { sortByPropertyCI } from 'utils/arrayUtils';
    import Waterfall from 'components/content/Waterfall';
    import { MediaNamespace } from 'store/modules/media';
    import { getAllModelsOfType } from 'utils/modelUtils';
    import InfiniteLoader from 'components/InfiniteLoader';
    import ContentNotification from 'components/content/ContentNotification';

    export default {
        name: 'RouteCollectionAlbums',

        computed: {
            ...mapState(MediaNamespace, {
                albumOffset: state => state.albumOffset,
                totalAlbums: state => state.totalAlbums,
            }),

            /**
             *  Get all albums, sorted by their name.
             *
             * @returns {Array}
             */
            albumCollection() {
                return getAllModelsOfType(ModelType.ALBUM)
                    .map(parseAlbum)
                    .sort(sortByPropertyCI('name'));
            },

            isFinishedLoading() {
                return !isNaN(this.totalAlbums) && (this.albumOffset >= this.totalAlbums);
            },
        },

        methods: {
            ...mapActions(MediaNamespace, {
                loadAlbums: 'loadAlbums',
            }),

            loadMoreAlbums() {
                return this.loadAlbums({
                    offset: this.albumOffset,
                    take: 40,
                });
            },
        },

        components: {
            Button,
            AlbumCard,
            Waterfall,
            InfiniteLoader,
            ContentNotification,
        },
    };
</script>

<style src="./Albums.scss" lang="scss"></style>
