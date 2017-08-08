<template>
    <div class="component-album-header">
        <Header>
            <h1>{{album.name}}</h1>
            <p>
                Album released by
                <router-link :to="artistLink">{{album.artist.name}}</router-link>
                in {{album.year ? album.year : 'an unknown year'}}.
            </p>
            <HeaderInfo>
                <HeaderInfoItem
                    icon="music_note"
                    :value="album.songCount.toString()"
                />
                <HeaderInfoItem icon="access_time" :value="totalDuration" />
            </HeaderInfo>
        </Header>
    </div>
</template>

<script>
    import Params from 'data/enum/Params';
    import PageNames from 'data/enum/PageNames';
    import { timeString } from 'utils/timeUtils';
    import Header from 'components/content/Header';
    import HeaderInfo from 'components/content/HeaderInfo';
    import LeafPlayerPropTypes from 'data/propTypes/LeafPlayerPropTypes';
    import HeaderInfoItem from 'components/content/HeaderInfoItem';

    export default {
        name: 'ComponentAlbumHeader',

        props: {
            album: LeafPlayerPropTypes.album.isRequired,
        },

        computed: {
            /**
             * Get total duration of all songs in the album.
             *
             * @returns {string}
             */
            totalDuration() {
                return timeString(this.album.totalDuration, true, false);
            },

            artistLink() {
                return {
                    name: PageNames.ARTIST,
                    params: { [Params.ARTIST_ID]: this.album.artist.id },
                };
            },
        },

        components: {
            Header,
            HeaderInfo,
            HeaderInfoItem,
        },
    };
</script>

<style src="./AlbumHeader.scss" lang="scss"></style>
