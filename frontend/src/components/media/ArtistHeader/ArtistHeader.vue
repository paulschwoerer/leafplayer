<template>
    <div class="component-artist-header">
        <Header>
            <h1>{{artist.name}}</h1>
            <p>This is some cool artist info.</p>
            <HeaderInfo>
                <HeaderInfoItem icon="album" :value="String(artist.albumCount)" />
                <HeaderInfoItem icon="access_time" :value="totalDuration" />
            </HeaderInfo>
        </Header>
    </div>
</template>

<script>
    import { timeString } from 'utils/timeUtils';
    import Header from 'components/content/Header';
    import HeaderMenu from 'components/content/HeaderMenu';
    import HeaderInfo from 'components/content/HeaderInfo';
    import HeaderInfoItem from 'components/content/HeaderInfoItem';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';

    export default {
        name: 'ComponentArtistHeader',

        props: {
            artist: LeafPlayerPropTypes.artist.isRequired,
        },

        data() {
            return {
                menuItems: [
                    { route: 'artist.overview', label: 'Overview' },
                    { route: 'artist.discography', label: 'Discography' },
                    { route: 'artist.songs', label: 'Songs' },
                ],
            };
        },

        computed: {
            /**
             * Get total duration of all songs from this artist.
             *
             * @returns {string}
             */
            totalDuration() {
                return timeString(this.artist.totalDuration, true, false);
            },
        },

        components: {
            Header,
            HeaderInfo,
            HeaderMenu,
            HeaderInfoItem,
        },
    };
</script>

<style src="./ArtistHeader.scss" lang="scss"></style>
