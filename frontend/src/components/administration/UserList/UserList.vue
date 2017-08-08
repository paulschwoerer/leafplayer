<template>
    <div class="component-user-list">
        <Button icon="add_circle_outline" :onClick="handleUserCreation" >Create new User</Button>

        <table class="list">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Roles</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="user in userList" :key="user.id">
                    <td>{{user.id}}</td>
                    <td>{{user.name}}</td>
                    <td class="roles">
                        <span class="role" v-for="role in user.roles">{{role.displayName}}</span>
                    </td>
                    <td class="actions">
                        <!--<Icon v-if="user.id !== currentUserId" name="mode_edit" />-->
                        <Icon v-if="user.id !== currentUserId" name="delete" :onClick="() => handleUserDeletion(user)" />
                    </td>
                </tr>
            </tbody>
        </table>
        <InfiniteLoader :loadMoreItems="loadMoreUsers" :finishedLoading="isFinishedLoadingUsers" />
    </div>
</template>

<script>
    import Input from 'components/form/Input';
    import Button from 'components/form/Button';
    import Icon from 'components/content/Icon';
    import ModelType from 'data/enum/ModelType';
    import { mapState, mapActions } from 'vuex';
    import { sortByPropertyCI } from 'utils/arrayUtils';
    import { ModalNamespace } from 'store/modules/modal';
    import { getAllModelsOfType } from 'utils/modelUtils';
    import InfiniteLoader from 'components/InfiniteLoader';
    import CreateUserModal from 'components/modal/CreateUserModal';
    import { AdministrationNamespace } from 'store/modules/administration';
    import ConfirmDeleteUserModal from 'components/modal/ConfirmDeleteUserModal';

    export default {
        name: 'ComponentUserList',

        data() {
            return {};
        },

        computed: {
            ...mapState({
                currentUserId: state => state.auth.userId,
            }),

            ...mapState(AdministrationNamespace, {
                totalUsers: state => state.totalUsers,
                userOffset: state => state.userOffset,
            }),

            /**
             * Sorted list of all users.
             *
             * @returns {Array}
             */
            userList() {
                return getAllModelsOfType(ModelType.USER).sort(sortByPropertyCI('id'));
            },

            isFinishedLoadingUsers() {
                return !isNaN(this.totalUsers) && (this.userOffset >= this.totalUsers);
            },
        },

        methods: {
            ...mapActions(ModalNamespace, {
                openModal: 'openModal',
            }),

            ...mapActions(AdministrationNamespace, {
                loadUsers: 'loadUsers',
            }),

            loadMoreUsers() {
                return this.loadUsers({ offset: this.userOffset });
            },

            handleUserCreation() {
                this.openModal({
                    component: CreateUserModal,
                });
            },

            handleUserDeletion(user) {
                this.openModal({
                    component: ConfirmDeleteUserModal,
                    props: { user },
                });
            },

            handleUserEdit() {

            },
        },

        components: {
            Icon,
            Input,
            Button,
            InfiniteLoader,
        },
    };
</script>

<style src="./UserList.scss" lang="scss"></style>
