<template>
    <div class="component-change-password">
        <h2>Change Password</h2>

        <transition name="fade" mode="out-in">
            <div v-if="!passwordChangeSuccess" class="change-password-form" key="change">
                <ValidationForm submitLabel="Change" :fields="formFields" :value="formValues" :onSubmit="handleSubmit" />
            </div>
            <div v-if="passwordChangeSuccess" class="password-changed" key="changed">
                <Icon name="check_circle" />
                <p>You changed your password successfully!</p>
            </div>
        </transition>
    </div>
</template>

<script>
    import { getValue } from 'utils/injector';
    import { ADAPTER } from 'data/Injectables';
    import Icon from 'components/content/Icon';
    import ValidationForm from 'components/form/ValidationForm';
    import { validatePassword } from 'utils/securityUtils';
    import Button from 'components/form/Button';
    import Input from 'components/form/Input';

    export default {
        name: 'ComponentChangePassword',

        data() {
            return {
                passwordChangeSuccess: false,
                oldPasswordWrong: false,

                formValues: {
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                },
            };
        },

        computed: {
            formFields() {
                return [
                    {
                        name: 'oldPassword',
                        type: 'password',
                        label: 'Your old password',
                        required: true,
                        errorOverride: this.oldPasswordWrong ? 'Password is not correct' : '',
                    },
                    {
                        name: 'newPassword',
                        type: 'password',
                        label: 'New password',
                        required: true,
                        validators: [{
                            validate: validatePassword,
                            message: 'At least 8 characters, numbers and letters',
                        }],
                    },
                    {
                        name: 'confirmPassword',
                        type: 'password',
                        label: 'Confirm new password',
                        required: true,
                        validators: [{
                            validate: () => this.formValues.newPassword === this.formValues.confirmPassword,
                            message: 'Passwords do not match',
                        }],
                    },
                ];
            },
        },

        methods: {
            handleSubmit() {
                this.oldPasswordWrong = false;

                return getValue(ADAPTER).post('auth/password', this.formValues)
                    .then(() => {
                        this.passwordChangeSuccess = true;
                    }).catch((error) => {
                        if (error.code === 'wrong_password') {
                            this.oldPasswordWrong = true;
                        }
                    });
            },
        },

        components: {
            Icon,
            Input,
            Button,
            ValidationForm,
        },
    };
</script>

<style src="./ChangePassword.scss" lang="scss"></style>
