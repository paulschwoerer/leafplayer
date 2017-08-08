<script>
    import { mapState, mapActions } from 'vuex';

    export default {
        name: 'ComponentModalRoot',

        watch: {
            isModalVisible(value) {
                if (value) {
                    document.body.classList.add('no-scroll');
                } else {
                    document.body.classList.remove('no-scroll');
                }
            },
        },

        computed: mapState('modal', {
            isModalVisible: state => state.visible,

            modalConfig: state => state.modalConfig,
        }),

        methods: mapActions('modal', {
            closeModal: 'closeModal',
        }),

        render(h) {
            /* eslint-disable quote-props */
            return h('div', { 'class': 'component-modal-root' }, [
                h('transition', { props: { name: 'modal-root-background' } },
                    [this.isModalVisible ? h('div', { 'class': 'modal-background', on: { click: this.closeModal } }, [
                        h(this.modalConfig.getComponent(), { props: this.modalConfig.getProps() }),
                    ]) : null],
                )]);
            /* eslint-enable quote-props */
        },
    };
</script>

<style src="./ModalRoot.scss" lang="scss"></style>
