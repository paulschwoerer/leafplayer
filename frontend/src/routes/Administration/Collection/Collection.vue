<template>
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
                :clearCollection="clearCollection"
            />
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import FolderList from 'components/administration/FolderList';
    import ScanProgress from 'components/administration/ScanProgress';
    import ScannerActions from 'components/administration/ScannerActions';

    export default {
        name: 'RouteAdministrationCollection',

        mounted() {
            this.updateProgress();
        },

        computed: mapState('administration', {
            scan: state => state.scan,
            folders: state => state.folders,
        }),

        methods: {
            ...mapActions('administration', {
                addFolder: 'addFolder',
                scanCollection: 'scanCollection',
                cleanCollection: 'cleanCollection',
                clearCollection: 'clearCollection',
                removeFolder: 'removeFolder',
                loadAllFolders: 'loadAllFolders',
                updateProgress: 'updateProgress',
                updateFolderSelectedState: 'updateFolderSelectedState',
            }),
        },

        components: {
            FolderList,
            ScannerActions,
            ScanProgress,

        },
    };
</script>

<style src="./Collection.scss" lang="scss"></style>
