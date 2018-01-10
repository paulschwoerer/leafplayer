#<template>
    <div class="route-administration-collection">
        <div class="grid">
            <transition name="fade" mode="out-in">
                <FolderList
                    v-if="!scan.running"
                    :folders="folders"
                    :addFolder="addFolder"
                    :removeFolder="removeFolder"
                    :loadAllFolders="loadAllFolders"
                    :updateFolderSelectedState="updateFolderSelectedState"
                />
                <ScanProgress v-if="scan.running" :scan="scan" />
            </transition>
            <ScannerActions
                :scanRunning="scan.running"
                :scanCollection="scanCollection"
                :cleanCollection="cleanCollection"
                :wipeCollection="wipeCollection"
            />
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import FolderList from 'components/administration/FolderList';
    import ScanProgress from 'components/administration/ScanProgress';
    import ScannerActions from 'components/administration/ScannerActions';
    import { serializeUrlParams } from '../../../utils/urlUtils';
    import { getValue } from '../../../utils/injector';
    import { ADAPTER } from '../../../data/Injectables';

    export default {
        name: 'RouteAdministrationCollection',

        mounted() {
            this.createEventSource();
        },

        beforeDestroy() {
            this.destroyEventSource();
        },

        computed: mapState({
            scan: state => state.administration.scan,
            folders: state => state.administration.folders,
            apiBaseUrl: state => state.config.api.base,
            authToken: state => state.auth.token,
        }),

        methods: {
            ...mapActions('administration', {
                addFolder: 'addFolder',
                removeFolder: 'removeFolder',
                loadAllFolders: 'loadAllFolders',
                updateProgress: 'updateProgress',
                updateFolderSelectedState: 'updateFolderSelectedState',
            }),

            scanCollection() {
                return getValue(ADAPTER).post('library/scan');
            },

            cleanCollection() {
                return getValue(ADAPTER).post('library/clean');
            },

            wipeCollection() {
                return getValue(ADAPTER).post('library/wipe');
            },

            createEventSource() {
                const eventSource = new EventSource(`${this.apiBaseUrl}library/scan-progress${serializeUrlParams({
                    token: this.authToken,
                    refresh_interval: 0.2,
                })}`);

                eventSource.addEventListener('message', (e) => {
                    this.updateProgress(JSON.parse(e.data));
                }, false);

                this.eventSource = eventSource;
            },

            destroyEventSource() {
                if (this.eventSource) {
                    this.eventSource.close();
                    this.eventSource = null;
                }
            },
        },

        components: {
            FolderList,
            ScannerActions,
            ScanProgress,
        },
    };
</script>

<style src="./Collection.scss" lang="scss"></style>
