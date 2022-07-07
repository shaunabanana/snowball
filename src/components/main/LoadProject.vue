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
    </a-modal>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { readProject } from '@/utils/io';

export default {
    name: 'LoadProject',

    props: {

    },

    data() {
        return {
            visible: true,
        };
    },

    methods: {
        newProject() {
            ipcRenderer.invoke('new-project').then((savePath) => {
                if (!savePath) return;
                console.log(savePath);
                this.$store.commit('setProjectPath', savePath);
                this.visible = false;
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
                console.log(openPath[0]);
                this.$store.commit('setProjectPath', openPath[0]);
                this.$store.commit('setLoading', true);
                readProject(openPath[0]).then((projectData) => {
                    console.log(projectData);
                    this.$store.commit('loadProject', projectData);
                    this.$store.commit('setLoading', false);
                    this.visible = false;
                });
            });
            // open({ filters: [{ name: '', extensions: ["snowball"] }] }).then(openPath => {
            //     if (!openPath) return;
            //     this.$store.commit('setProjectPath', openPath);
            //     this.$emit("update:modelValue", openPath);
            //     this.$store.commit('setLoading', true);
            //     readProject(openPath).then(projectData => {
            //         console.log(projectData);
            //         this.$store.commit('loadProject', projectData);
            //         this.$store.commit('setLoading', false);
            //     })
            // });
        },
    },

    computed: {
        selectedKeys() {
            console.log([this.item]);
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
