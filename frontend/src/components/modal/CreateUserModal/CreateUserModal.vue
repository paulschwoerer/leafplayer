<template>
    <DefaultModal class="component-create-user-modal">
        <h2>Create a new User</h2>

        <ValidationForm v-model="formValues" submitLabel="Create User" :fields="formFields" :onSubmit="handleUserCreation" />
    </DefaultModal>
</template>

<script>
    import { mapActions } from 'vuex';
    import Input from 'components/form/Input';
    import Icon from 'components/content/Icon';
    import CheckBox from 'components/form/CheckBox';
    import { validateUsername, validatePassword } from 'utils/securityUtils';
    import DefaultModal from 'components/modal/DefaultModal';
    import ValidationForm from 'components/form/ValidationForm';

    export default {
        name: 'ComponentCreateUserModal',

        data() {
            return {
                formValues: {
                    username: '',
                    fullName: '',
                    password: '',
                },
                userAlreadyExists: false,
            };
        },

        computed: {
            formFields() {
                return [
                    {
                        name: 'username',
                        type: 'text',
                        label: 'Username',
                        maximumLength: 32,
                        required: true,
                        errorOverride: this.userAlreadyExists ? 'A user with this id already exists' : '',
                        validators: [{
                            validate: validateUsername,
                            message: 'Minimum 3 characters, only letters, numbers or underscore/dash',
                        }],
                    },
                    {
                        name: 'fullName',
                        type: 'text',
                        label: 'Full name',
                        required: true,
                    },
                    {
                        name: 'password',
                        type: 'password',
                        label: 'Strong password',
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
                createUser: 'administration/createUser',

                closeModal: 'modal/closeModal',
            }),

            handleUserCreation() {
                this.userAlreadyExists = false;

                return this.createUser({
                    id: this.formValues.username,
                    name: this.formValues.fullName,
                    password: this.formValues.password,
                    roles: [],
                }).then(this.closeModal)
                    .catch((error) => {
                        if (error.code === 'user.exists') {
                            this.userAlreadyExists = true;
                        }
                    });
            },
        },

        components: {
            Icon,
            Input,
            CheckBox,
            DefaultModal,
            ValidationForm,
        },
    };
</script>

<style src="./CreateUserModal.scss" lang="scss"></style>
