<template>
    <div class="route-login">
        <div class="login-logo">
            <img src="../../assets/svg/leafplayer-logo.svg" alt="Leafplayer logo">
            <h1 class="name">Leafplayer</h1>
        </div>

        <div class="feedback-container">
            <transition name="fade">
                <div class="login-error" v-if="error">
                    <b>Oh oh, an error occured!</b>
                    <p>{{error.description}} <span v-if="error.status">({{error.status}})</span></p>
                </div>
            </transition>
        </div>

        <ValidationForm
            :fields="formFields"
            :value="formValues"
            :onSubmit="handleLogin"
            submitLabel="Login"
            variation="light"
            button-variation="white-border"
        />

        <footer>
            <p>LeafPlayer ALPHA <small>© {{year}} Paul Schwörer</small></p>
        </footer>
    </div>
</template>

<script>
    import Logo from 'components/Logo';
    import ValidationForm from 'components/form/ValidationForm';

    export default {
        name: 'RouteLogin',

        data() {
            return {
                formValues: {
                    username: '',
                    password: '',
                },

                error: null,
            };
        },

        computed: {
            formFields() {
                return [
                    {
                        name: 'username',
                        label: 'Username',
                        required: true,
                    },
                    {
                        name: 'password',
                        type: 'password',
                        label: 'Password',
                        required: true,
                    },
                ];
            },

            year() {
                return new Date().getFullYear();
            },
        },

        methods: {
            handleLogin() {
                this.error = null;

                const loginTimeout = setTimeout(() => {
                    this.error = {
                        message: 'The connection to the server timed out.',
                    };
                }, 5000); // timeout after 5 seconds

                this.$auth.login(this.formValues).then(() => {
                    clearTimeout(loginTimeout);
                }).catch((error) => {
                    clearTimeout(loginTimeout);
                    this.error = error;
                });
            },
        },

        components: {
            Logo,
            ValidationForm,
        },
    };
</script>

<style lang="scss" src="./Login.scss"></style>
