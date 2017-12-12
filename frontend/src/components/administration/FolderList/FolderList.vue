<template>
    <div class="component-folder-list">
        <transition-group name="list" tag="div">
            <div class="folder" v-for="folder in folders" :key="folder.path">
                <CheckBox
                    @input="(event) => updateFolderSelectedState({ id: folder.id, selected: event })"
                    :value="folder.selected"
                    class="folder-checkbox"
                    :label="folder.path"
                    title="Check to include folder in scans."
                    variation="light"
                />
                <Icon class="folder-remove-icon" :onClick="() => removeFolder({ id: folder.id })" name="remove_circle" />
            </div>
        </transition-group>

        <div class="no-folders" v-show="!folders.length">
            <p>You haven't added any folders yet.</p>
        </div>

        <!--<lp-spinner v-show="!folder.length"></lp-spinner>-->

        <form class="form" method="post" @submit.prevent="onSubmit">
            <Input
                ref="newFolderInput"
                label="Add new folder ..."
                v-model="newFolder"
                :error="error"
            />
        </form>
    </div>
</template>
s
<script>
    import VueTypes from 'vue-types';
    import { getValue } from 'utils/injector';
    import { ADAPTER } from 'data/Injectables';
    import Input from 'components/form/Input';
    import Icon from 'components/content/Icon';
    import CheckBox from 'components/form/CheckBox';
    import { serializeUrlParams } from 'utils/urlUtils';

    export default {
        name: 'ComponentFolderList',

        props: {
            folders: VueTypes.array.isRequired, // TODO: proper prop type
            updateFolderSelectedState: VueTypes.func.isRequired,
            loadAllFolders: VueTypes.func.isRequired,
            removeFolder: VueTypes.func.isRequired,
            addFolder: VueTypes.func.isRequired,
        },

        created() {
            this.loadAllFolders();
        },

        data() {
            return {
                newFolder: '',
                error: '',
            };
        },

        methods: {
            onSubmit() {
                if (this.newFolder.length) {
                    this.error = '';

                    getValue(ADAPTER).get(`library/folder/check${serializeUrlParams({ path: this.newFolder })}`).then(({ data }) => {
                        if (data.exists === false) {
                            this.error = 'This folder does not exist on the server or is not readable.';
                        } else if (data.writeable === false) {
                            this.error = 'This folder is not writeable.';
                        } else if (data.alreadyAdded === true) {
                            this.error = 'This folder was already added.';
                        } else if (data.success === true) {
                            return this.addFolder({
                                path: data.cleanPath,
                                selected: true,
                            }).then(() => {
                                this.newFolder = '';
                                this.error = '';
                            });
                        }

                        return Promise.reject();
                    });
                }
            },
        },

        components: {
            Icon,
            Input,
            CheckBox,
        },
    };
</script>

<style src="./FolderList.scss" lang="scss"></style>
