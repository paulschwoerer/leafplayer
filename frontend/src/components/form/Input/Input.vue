<template>
    <div
        class="component-input"
        :class="[{ 'has-error': hasError, focused: userFocused || autoFocused, 'has-been-focused': hasBeenFocused }, variation]"
        @keyup.enter="blur"
    >
        <div class="textarea-height-fix" v-if="type === 'textarea'" v-html="fixedValue" />

        <textarea
            v-if="type === 'textarea'"
            :required="required"
            :autofocus="autofocus"
            :value="value"
            :maxlength="maximumLength"
            @input="$emit('input', $event.target.value);"
            @focus="focus"
            @blur="blur"
        />

        <input
            v-else
            :type="type"
            :required="required"
            :autocomplete="autocomplete"
            :autofocus="autofocus"
            :value="value"
            :maxlength="maximumLength"
            @input="$emit('input', $event.target.value)"
            @focus="focus"
            @blur="blur"
        >
        <label>{{label}}</label>

        <Icon class="error-icon" name="error_outline" />
        <div class="error-message">
            <span>{{error}}</span>
        </div>
    </div>
</template>

<script>
    import VueTypes from 'vue-types';
    import Icon from 'components/content/Icon';

    export default {
        name: 'ComponentInput',

        props: {
            label: VueTypes.string.isRequired,
            value: VueTypes.string.isRequired,

            required: VueTypes.bool.def(false),
            type: VueTypes.oneOf(['text', 'email', 'password', 'search', 'url', 'number', 'date', 'textarea']).def('text'),
            autocomplete: VueTypes.oneOf(['on', 'off']).def('off'),
            autofocus: VueTypes.bool.def(false),
            variation: VueTypes.oneOf(['light', 'dark']).def('dark'),
            maximumLength: VueTypes.number.def(255),
            error: VueTypes.string.def(''),

            onBlur: VueTypes.func,
            onFocus: VueTypes.func,
        },

        data() {
            return {
                userFocused: false,
                autoFocused: false,
                hasBeenFocused: false,
            };
        },

        mounted() {
            this.autoFocused = !this.isEmpty;
        },

        updated() {
            this.autoFocused = !this.isEmpty;
        },

        computed: {
            isEmpty() {
                return this.value.length === 0;
            },

            hasError() {
                return this.error.length > 0;
            },

            fixedValue() {
                return encodeURIComponent(this.value).replace(/%0/g, '<br/>');
            },
        },

        methods: {
            focus() {
                this.onFocus();

                this.userFocused = true;
            },

            blur() {
                this.onBlur();

                if (!this.hasBeenFocused) {
                    this.hasBeenFocused = true;
                }

                if (this.isEmpty) {
                    this.userFocused = false;
                    this.autoFocused = false;
                }
            },
        },

        components: {
            Icon,
        },
    };
</script>

<style src="./Input.scss" lang="scss"></style>
