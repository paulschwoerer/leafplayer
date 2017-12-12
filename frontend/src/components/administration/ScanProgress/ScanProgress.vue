<template>
    <div class="component-scan-progress">
        <div class="progress-bar">
            <div class="progress" :style="{ width: `${progress}%`}">

            </div>
        </div>

        <!--<div v-if="scan.running">
            &lt;!&ndash;<CircleProgress :size="200" :progress="progress"></CircleProgress>&ndash;&gt;
            &lt;!&ndash;<div class="details">
                <p class="state">{{currentState}}</p>
                <p>{{scan.details.currentFile}}</p>
                <p v-if="isScanning || isSearching">
                    Found <span class="bold">{{scan.details.totalFiles}}</span> songs,
                    scanned <span class="bold">{{scan.details.scannedFiles}}</span> of those.
                </p>
            </div>&ndash;&gt;
        </div>-->
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import CircleProgress from 'components/CircleProgress';
    import ScannerState from 'data/enum/ScannerState';

    export default {
        name: 'ComponentScanProgress',

        props: {
            scan: VueTypes.shape({
                running: VueTypes.bool,
                details: VueTypes.shape({
                    type: VueTypes.string,
                    currentState: VueTypes.number,
                    currentItem: VueTypes.string,
                    totalItemCount: VueTypes.number,
                    processedItemCount: VueTypes.number,
                }),
            }).isRequired,
        },

        computed: {
            progress() {
                const { details } = this.scan;

                return details.totalItemCount ? Math.floor((details.processedItemCount / details.totalItemCount) * 100) : 0;
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
