<template>
    <div class="component-queue-header">
        <CHeader>
            <h1>Queue</h1>
            <p>This is your current queue.</p>
            <HeaderInfo>
                <HeaderInfoItem icon="music_note" :value="String(songCount)" />
                <HeaderInfoItem icon="access_time" :value="totalDuration" />
            </HeaderInfo>
        </CHeader>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import CHeader from 'components/content/Header';
    import HeaderInfo from 'components/content/HeaderInfo';
    import HeaderInfoItem from 'components/content/HeaderInfoItem';

    export default {
        name: 'ComponentQueueHeader',

        props: {
            songCount: VueTypes.number.isRequired,

            totalDuration: VueTypes.string.isRequired,
        },

        components: {
            CHeader,
            HeaderInfo,
            HeaderInfoItem,
        },
    };
</script>

<style src="./QueueHeader.scss" lang="scss"></style>
