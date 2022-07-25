<template>
    <a-modal
        v-model:visible="visible"
        :closable="false"
        :simple="true"
        :mask-closable="false"
        :footer="false"
    >
        <template #title>
            Hi, researcher!
        </template>
        <a-row :gutter="24">
            <a-col :span="12">
                <a-card hoverable class="card-button" @click="newProject">
                    <IconPlus :size="32"/>
                    <br />
                    Start a new project
                </a-card>
            </a-col>
            <a-col :span="12">
                <a-card hoverable class="card-button" @click="openProject">
                    <IconFolder :size="32"/>
                    <br />
                    Open an existing one
                </a-card>
            </a-col>
        </a-row>

        <a-modal v-model:visible="askUpgrade" okText="Continue"
            @ok="convertAndLoad" @cancel="askUpgrade = false"
        >
            <template #title>
                Older Snowball Project
            </template>
            <span v-if="backwardsCompatible">
                This is a project created with an older version of Snowball.
                By continuing to opening it with this version,
                no breaking changes will be made.
                you'll still be able to open it with the original version.
            </span>
            <span v-else>
                This is a project created with an older version (0.1.X) of Snowball.
                Opening it will upgrade its contents, and make it imcompatible with older versions.
                Would you like to continue?
            </span>
        </a-modal>
    </a-modal>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { basename } from 'path';
import { readProject, writeProject } from '@/utils/io';
import { convertFromOlderVersion, checkCompatibility } from '@/utils/compatibility';

export default {
    name: 'LoadProject',

    props: {

    },

    data() {
        return {
            visible: true,
            askUpgrade: false,
            toConvert: null,
            backwardsCompatible: false,
        };
    },

    methods: {
        setWindowTitle(filePath) {
            ipcRenderer.send('set-title', basename(filePath));
        },

        newProject() {
            ipcRenderer.invoke('new-project').then((savePath) => {
                if (!savePath) return;
                this.setWindowTitle(savePath);
                this.$store.commit('setProjectPath', {
                    shouldInit: true,
                    path: savePath,
                });
                this.visible = false;
                this.$emit('done');
            });
            // save({ filters: [{ name: '', extensions: ["snowball"] }] }).then((savePath) => {
            //     if (!savePath) return;
            //     this.$store.commit('setProjectPath', savePath);
            //     this.$emit("update:modelValue", savePath);
            // });
        },

        openProject() {
            ipcRenderer.invoke('open-project').then((openPath) => {
                if (!openPath || openPath.length === 0) return;
                readProject(openPath[0]).then((projectData) => {
                    console.log(`[LoadProject][openProject] Project data version: ${projectData.version}`);
                    const compatibility = checkCompatibility(this.$store.state, projectData);
                    console.log(`[LoadProject][openProject] Compatibility: ${JSON.stringify(compatibility)}`);
                    if (!compatibility.backwardsCompatible) {
                        console.log('[LoadProject][openProject] The project file is created with an older version of Snowball. Asking for confirmation.');
                        this.toConvert = projectData;
                        this.backwardsCompatible = false;
                        this.askUpgrade = true;
                    } else if (compatibility.needConversion) {
                        console.log('[LoadProject][openProject] The project file is created with an older version of Snowball. Asking for confirmation.');
                        this.toConvert = projectData;
                        this.backwardsCompatible = true;
                        this.askUpgrade = true;
                    } else {
                        this.setWindowTitle(openPath[0]);
                        this.$store.commit('setProjectPath', { path: openPath[0] });
                        this.$store.commit('loadProject', projectData);
                        this.$store.commit('setLoading', false);
                        this.visible = false;
                        this.$emit('done');
                    }
                });
            });
        },

        convertAndLoad() {
            const converted = convertFromOlderVersion(this.$store.state, this.toConvert);
            this.setWindowTitle(converted.projectPath);
            this.$store.commit('setProjectPath', { path: converted.projectPath });
            this.$store.commit('loadProject', converted);
            writeProject(this.$store.state).then(() => {
                this.$store.commit('setLoading', false);
                this.visible = false;
                this.$emit('done');
            });
        },
    },

    computed: {
        selectedKeys() {
            return [this.item];
        },
    },
};
</script>

<style scoped>
.card-button {
    cursor: pointer;
    text-align: center;
    margin-top: 1rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    transition-property: all;
}

.card-button:hover {
  transform: translateY(-2px);
}

.card-button:active {
  transform: translateY(0px);
}
</style>
