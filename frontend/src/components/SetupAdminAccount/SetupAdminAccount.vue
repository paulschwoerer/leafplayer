<template>
    <div class="component-setup-admin-account">
        <div class="logo-container">
            <img src="../../assets/svg/leafplayer-logo.svg" alt="Leafplayer logo">
        </div>

        <div class="welcome">
            <h2>Welcome!</h2>
        </div>

        <div class="steps">
            <div class="step">
                <p>1. Create an Admin Account</p>

                <ValidationForm
                    :fields="formFields"
                    :value="formValues"
                    :onSubmit="handleAdminCreation"
                    submitLabel="Looks good to me!"
                    variation="light"
                    button-variation="white-border"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions } from 'vuex';
    import ValidationForm from 'components/form/ValidationForm';
    import { validateUsername, validatePassword } from 'utils/securityUtils';

    export default {
        name: 'ComponentSetupAdminAccount',

        props: {

        },

        data() {
            return {
                formValues: {
                    username: '',
                    displayName: '',
                    password: '',
                },
            };
        },

        computed: {
            formFields() {
                return [
                    {
                        name: 'username',
                        label: 'Username',
                        required: true,
                        validators: [{
                            validate: validateUsername,
                            message: 'Minimum 3 characters, only letters, numbers or underscore/dash',
                        }],
                    },
                    {
                        name: 'displayName',
                        label: 'Display Name',
                        required: true,
                    },
                    {
                        name: 'password',
                        type: 'password',
                        label: 'Password',
                        required: true,
                        validators: [{
                            validate: validatePassword,
                            message: 'At least 8 characters, numbers and letters',
                        }],
                    },
                ];
            },
        },

        methods: {
            ...mapActions({
                createAdminAccount: 'administration/createAdminAccount',
            }),

            handleAdminCreation() {
                this.createAdminAccount(this.formValues);
            },
        },

        components: {
            ValidationForm,
        },
    };
</script>

<style src="./SetupAdminAccount.scss" lang="scss"></style>
