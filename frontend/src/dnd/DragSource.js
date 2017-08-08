import Vue from 'vue';
import { mapActions } from 'vuex';
import createMonitor from './createMonitor';
import { pick, getComponentProps, getComponentName, getBaseComponent, assert } from './utils';

export default (type, source = {}) => {
    assert(typeof type === 'string', `[VueDnD] Type must be a string, '${typeof type}' given`);
    assert(typeof source === 'object', `[VueDnD] Source must be an object, '${typeof source}' given`);
    assert(!(source instanceof Array), '[VueDnD] Source cannot be an array.');

    /**
     * Prop keys the wrapper component uses and that will be ignored while getting props from the wrapped component.
     *
     * @type Array
     */
    const propKeys = [
        'isDragging',
    ];

    /**
     * Prop keys, that will be ignored while getting the prop keys from the wrapped component.
     *
     * @type Array
     */
    const ignorePropKeys = [];

    /**
     * Constructs a wrapper component around the component that was passed into the function.
     */
    return (Component) => {
        const name = getComponentName(Component);
        const componentProps = getComponentProps(Component, propKeys, ignorePropKeys);

        return Vue.extend({
            name: `DragSource-${name}`,

            props: componentProps,

            components: {
                [name]: Component,
            },

            data() {
                return {
                    isDragging: false,
                };
            },

            created() {
                this.isWrapperComponent = true;
            },

            beforeDestroy() {
                if (this.isDragging) {
                    this.handleDragEnd();
                }
            },

            methods: {
                ...mapActions('dnd', {
                    startDragging: 'startDragging',
                    stopDragging: 'stopDragging',
                }),

                /**
                 * Handle the dragstart event on the wrapped component.
                 *
                 * @param e
                 */
                handleDragStart(e) {
                    const base = getBaseComponent(this);

                    const dragData = typeof source.dragData === 'function' ? source.dragData(base) : null;
                    const dragImage = typeof source.dragPreview === 'function' ? source.dragPreview(dragData) : null;

                    this.startDragging(createMonitor(type, base, dragData));

                    this.isDragging = true;

                    e.dataTransfer.effectAllowed = 'move';

                    if (dragImage) {
                        e.dataTransfer.setDragImage(dragImage, 0, 0);
                    }
                },

                /**
                 * Handle the dragend event on the wrapped component.
                 */
                handleDragEnd() {
                    this.stopDragging();

                    this.isDragging = false;
                },
            },

            /**
             * Render the wrapped component as the only child component.
             *
             * @param h
             * @returns {*}
             */
            render(h) {
                return h(name, {
                    props: pick(this, Object.keys(componentProps).concat(propKeys)),

                    attrs: {
                        draggable: true,
                    },

                    nativeOn: {
                        dragstart: this.handleDragStart,
                        dragend: this.handleDragEnd,
                    },
                });
            },
        });
    };
};
