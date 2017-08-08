<template>
    <div class="component-check-box" :class="{ light: variation === 'light' }">
        <label>
            <Icon v-show="!value" name="check_box_outline_blank"/>
            <Icon v-show="value" name="check_box"/>

            <input type="checkbox" :checked="value" :required="required" @change="handleChange">
            <span>{{ label }}</span>
        </label>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Icon from 'components/content/Icon';

    export default {
        name: 'ComponentCheckBox',

        props: {
            label: VueTypes.string.isRequired,

            variation: VueTypes.oneOf(['dark', 'light']).def('dark'),

            required: VueTypes.bool.def(false),

            value: VueTypes.bool,
        },

        methods: {
            handleChange(event) {
                this.$emit('input', event.target.checked);
            },
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./CheckBox.scss" lang="scss"></style>
