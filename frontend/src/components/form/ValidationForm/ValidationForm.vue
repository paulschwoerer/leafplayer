<template>
    <div class="component-validation-form">
        <form action="/" method="post" @submit.prevent="handleSubmit">
            <div class="input-group" v-for="field in fields">
                <CheckBox
                    v-if="field.type === 'checkbox'"
                    :label="field.label"
                    v-model="value[field.name]"
                    :variation="variation"
                    @input="validateInput(field)"
                    :error="getErrorForField(field)"
                />

                <Input
                    v-else
                    :label="field.label"
                    v-model="value[field.name]"
                    :variation="variation"
                    :type="field.type"
                    :maximumLength="field.maximumLength"
                    :error="getErrorForField(field)"
                    :onBlur="() => validateInput(field)"
                    @input="handleInputChange(field)"
                />
            </div>

            <div class="form-submit">
                <Button :variation="buttonVariation" :loading="busy">{{submitLabel}}</Button>
            </div>
        </form>
    </div>
</template>

<script>
    import Vue from 'vue';
    import VueTypes from 'vue-types';
    import Input from 'components/form/Input';
    import Button from 'components/form/Button';
    import CheckBox from 'components/form/CheckBox';

    export default {
        name: 'ComponentValidationForm',

        props: {
            onSubmit: VueTypes.func,

            submitLabel: VueTypes.string.def('Submit'),

            value: VueTypes.isRequired,

            variation: VueTypes.oneOf(['dark', 'light']).def('dark'),

            buttonVariation: Button.props.variation,

            fields: VueTypes.arrayOf(VueTypes.shape({
                name: VueTypes.string.isRequired,
                label: VueTypes.string.isRequired,
                // in case some extra error info needs to be shown. Will not prevent form from submitting
                errorOverride: VueTypes.string,
                type: VueTypes.oneOf([
                    'text',
                    'email',
                    'password',
                    'search',
                    'url',
                    'number',
                    'date',
                    'textarea',
                    'checkbox',
                ]),
                required: VueTypes.bool,
                maximumLength: VueTypes.number,
                validators: VueTypes.arrayOf(VueTypes.shape({
                    validate: VueTypes.func,
                    message: VueTypes.string,
                })),
            })),
        },

        watch: {
            fields() {
                this.validateAllFields();
            },
        },

        data() {
            return {
                // hashmap to store all field errors
                errors: {},

                busy: false,
            };
        },

        computed: {
            canSubmit() {
                return this.fields.findIndex(field => !this.validateField(field)) === -1;
            },
        },

        methods: {
            /**
             * Handle the change of an input.
             */
            handleInputChange(field) {
                if (this.hasErrors(field)) {
                    this.validateField(field);
                }
            },

            /**
             * Validate the input of a field.
             */
            validateInput(field) {
                this.validateField(field);
            },

            /**
             * Handle submitting the form.
             */
            handleSubmit() {
                this.validateAllFields();

                if (!this.hasErrors()) {
                    const promise = this.onSubmit();

                    if (!!promise && typeof promise.then === 'function') {
                        this.busy = true;

                        promise
                            .then(() => { this.busy = false; })
                            .catch(() => { this.busy = false; });
                    }
                }
            },

            /**
             * Validate all fields.
             */
            validateAllFields() {
                this.fields.forEach(this.validateField);
            },

            /**
             * Validate an input field. Returns true if the field was validated successfully.
             *
             * @param field
             * @returns {boolean}
             */
            validateField(field) {
                this.clearErrors(field);

                if (field.required && this.isFieldEmpty(field)) {
                    this.addError(field, 'This field is required.');
                }

                if (field.validators) {
                    field.validators.forEach((validator) => {
                        if (validator.validate(this.value[field.name]) !== true) {
                            this.addError(field, validator.message);
                        }
                    });
                }

                return this.errors[field.name].length === 0;
            },

            /**
             * Check if a field is empty.
             *
             * @param field
             * @returns {boolean}
             */
            isFieldEmpty(field) {
                const value = this.value[field.name];

                return value.length === 0 || !value.trim();
            },

            /**
             * Add an error to an input field.
             *
             * @param field
             * @param errorMessage
             */
            addError(field, errorMessage) {
                if (!this.errors[field.name]) {
                    Vue.set(this.errors, field.name, []);
                }

                this.errors[field.name].push(errorMessage);
            },

            getErrorForField(field) {
                if (field.errorOverride && field.errorOverride.length) {
                    return field.errorOverride;
                }

                return (this.errors[field.name] && this.errors[field.name].length) ? this.errors[field.name][0] : '';
            },

            /**
             * Clear errors of either a given field or all fields.
             *
             * @param field
             */
            clearErrors(field) {
                if (field) {
                    Vue.set(this.errors, field.name, []);
                } else {
                    this.errors = {};
                }
            },

            /**
             * Check if either a given field or any field has errors.
             *
             * @param field
             * @returns {boolean}
             */
            hasErrors(field = null) {
                if (field) {
                    return this.errors[field.name] && this.errors[field.name].length;
                }

                return Object.keys(this.errors).some(key => !!this.errors[key].length);
            },
        },

        components: {
            Input,
            Button,
            CheckBox,
        },
    };
</script>

<style src="./ValidationForm.scss" lang="scss"></style>
