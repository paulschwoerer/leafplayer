<template>
    <div class="route-search">
        <Header>
            <h1 v-if="searchQuery.length">Searching for "{{searchQuery}}"</h1>
            <h1 v-else>Start typing to search</h1>
        </Header>

        <ContentWrapper>
            <div class="searchField">
                <SearchInput autofocus />
            </div>

            <!-- Show spinner while searching -->
            <div class="search-busy" v-if="searchBusy">
                <Spinner variation="dark" />
            </div>

            <transition name="fade" mode="in-out">
                <!-- Display the search results -->
                <div class="search-results" v-if="!searchBusy && hasSearchResults" key="results">
                    <div class="artists" v-if="searchResults.artists.length">
                        <h2>Artists <span>{{searchResults.artists.length}}</span></h2>
                        <Carousel>
                            <ArtistCard v-for="id in searchResults.artists" :key="id" :artist="getArtist(id)" />
                        </Carousel>
                    </div>

                    <div class="albums" v-if="searchResults.albums.length">
                        <h2>Albums <span>{{searchResults.albums.length}}</span></h2>
                        <Carousel>
                            <AlbumCard v-for="id in searchResults.albums" :key="id" :album="getAlbum(id)" />
                        </Carousel>
                    </div>

                    <div class="songs" v-if="searchResults.songs.length">
                        <h2>Songs <span>{{searchResults.songs.length}}</span></h2>
                        <SongList :key="searchQuery" :songIds="searchResults.songs" showAlbum showArtist />
                    </div>
                </div>

                <div v-else-if="!searchBusy" key="no-results">
                    <ContentNotification icon="search">
                        No results were found for "{{searchQuery}}"
                    </ContentNotification>
                </div>
            </transition>
        </ContentWrapper>
    </div>
</template>

<script>
    import { CancelToken } from 'axios';
    import Spinner from 'components/Spinner';
    import ModelType from 'data/enum/ModelType';
    import Header from 'components/content/Header';
    import SongList from 'components/media/SongList';
    import debounce from 'throttle-debounce/debounce';
    import Carousel from 'components/content/Carousel';
    import AlbumCard from 'components/media/AlbumCard';
    import ArtistCard from 'components/media/ArtistCard';
    import { getArtist, getAlbum } from 'utils/mediaUtils';
    import { mapState, mapActions, mapGetters } from 'vuex';
    import SearchInput from 'components/search/SearchInput';
    import ContentWrapper from 'components/content/ContentWrapper';
    import ContentNotification from 'components/content/ContentNotification';

    export default {
        name: 'RouteSearch',

        created() {
            // used to cancel search requests if not needed anymore
            this.cancelTokenSource = null;
        },

        mounted() {
            this.debounceInput();
        },

        watch: {
            searchQuery() {
                this.debounceInput();
            },
        },

        computed: {
            ...mapState('search', {
                searchResults: state => state.searchResults,
                searchQuery: state => state.searchQuery,
                searchBusy: state => state.searchBusy,
            }),

            ...mapState('model', {
                songs: state => state[ModelType.SONG],
                albums: state => state[ModelType.ALBUM],
                artists: state => state[ModelType.ARTIST],
            }),

            ...mapGetters('search', {
                numberOfSearchResults: 'numberOfSearchResults',
            }),

            hasSearchResults() {
                return this.numberOfSearchResults > 0;
            },
        },

        methods: {
            ...mapActions('search', {
                performSearch: 'performSearch',
            }),

            /* eslint-disable func-names */
            debounceInput: debounce(250, function () {
                this.prepareSearch();
            }),

            prepareSearch() {
                if (this.cancelTokenSource !== null) {
                    this.cancelTokenSource.cancel();
                }

                this.cancelTokenSource = CancelToken.source();

                this.performSearch({
                    query: this.searchQuery,
                    cancelToken: this.cancelTokenSource.token,
                });
            },

            getAlbum(id) {
                return getAlbum(id);
            },

            getArtist(id) {
                return getArtist(id);
            },
        },

        components: {
            Header,
            Spinner,
            SongList,
            Carousel,
            AlbumCard,
            ArtistCard,
            SearchInput,
            ContentWrapper,
            ContentNotification,
        },
    };
</script>

<style src="./Search.scss" lang="scss"></style>
