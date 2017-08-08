<template>
    <div class="component-scan-progress">
        <div v-if="scan.running">
            <CircleProgress :size="200" :progress="progress"></CircleProgress>
            <div class="details">
                <p class="state">{{currentState}}</p>
                <p>{{scan.details.currentFile}}</p>
                <p v-if="isScanning || isSearching">
                    Found <span class="bold">{{scan.details.totalFiles}}</span> songs,
                    scanned <span class="bold">{{scan.details.scannedFiles}}</span> of those.
                </p>
            </div>
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import CircleProgress from 'components/CircleProgress';
    import ScannerState from 'data/enum/ScannerState';

    export default {
        name: 'ComponentScanProgress',

        props: {
            scan: VueTypes.object.isRequired,
        },

        computed: {
            progress() {
                const { details } = this.scan;
                return details.totalFiles !== 0 ? Math.floor((details.scannedFiles / details.totalFiles) * 100) : 0;
            },

            currentState() {
                const { details: { state } } = this.scan;

                switch (state) {
                    case ScannerState.IDLE:
                        return 'Not scanning';
                    case ScannerState.FINISHED:
                        return 'Scan finished';
                    case ScannerState.CLEANING:
                        return 'Cleaning database';
                    case ScannerState.CLEARING:
                        return 'Clearing database';
                    case ScannerState.SEARCHING:
                        return 'Searching for files';
                    case ScannerState.SCANNING:
                        return 'Scanning files';
                    default:
                        return 'Undefined state';
                }
            },

            isScanning() {
                const { details: { state } } = this.scan;

                return state === ScannerState.SCANNING;
            },

            isSearching() {
                const { details: { state } } = this.scan;

                return state === ScannerState.SEARCHING;
            },
        },

        components: {
            CircleProgress,
        },
    };
</script>

<style src="./ScanProgress.scss" lang="scss"></style>
