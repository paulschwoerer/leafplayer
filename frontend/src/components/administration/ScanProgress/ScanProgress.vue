<template>
    <div class="component-scan-progress">
        <div class="progress-bar">
            <div class="progress-bar-advance" :style="{ width: `${progress}%`}" />
            <div class="text-wrapper">
                <p class="status ellipsis">{{currentStatus}}</p>
                <p class="percentage">{{progress}}%</p>
            </div>
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Spinner from 'components/Spinner';
    import ScannerState from 'data/enum/ScannerState';
    import ScanType from 'data/enum/ScanType';

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

            currentStatus() {
                const { details } = this.scan;

                switch (details.currentState) {
                    case ScannerState.FINISHED:
                        return 'Finished';
                    case ScannerState.SEARCHING:
                        return 'Looking for files ...';
                    case ScannerState.PROCESSING: {
                        switch (details.type) {
                            case ScanType.CLEAN:
                                return 'Cleaning library';
                            case ScanType.WIPE:
                                return 'Wiping library';
                            case ScanType.SCAN:
                                return `Scanning "${details.currentItem}"`;
                            default:
                                return '';
                        }
                    }
                    default:
                        return '';
                }
            },
        },

        components: {
            Spinner,
        },
    };
</script>

<style src="./ScanProgress.scss" lang="scss"></style>
