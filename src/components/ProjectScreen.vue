<template>
    <el-dialog
        v-model="modalVisible"
        title="Hi, researcher!"
        :show-close="false"
        :close-on-click-modal="false"
    >
        <el-space :fill="true" :fill-ratio="10" style="width: 100%">
            <el-card
                shadow="hover"
                style="cursor: pointer; text-align: center"
                @click="newProject"
            >
                <el-icon :size="32">
                    <Plus />
                </el-icon>
                <br />
                <br />
                Start a new project
            </el-card>
            <el-card
                shadow="hover"
                style="cursor: pointer; text-align: center"
                @click="openProject"
            >
                <el-icon :size="32">
                    <Folder />
                </el-icon>
                <br />
                <br />
                Open an existing one
            </el-card>
        </el-space>
    </el-dialog>
</template>

<script>
import { open, save } from "@tauri-apps/api/dialog";
import { readProject } from "@/utils/io";

export default {
    name: "ProjectScreen",

    props: {
        modelValue: {
            type: String,
        },
    },

    data() {
        return {
            modalVisible: true,
        };
    },

    methods: {
        newProject() {
            save({ filters: [{ name: '', extensions: ["snowball"] }] }).then((savePath) => {
                this.$store.commit('setProjectPath', savePath);
                this.$emit("update:modelValue", savePath);
            });
        },

        openProject() {
            open({ filters: [{ name: '', extensions: ["snowball"] }] }).then(openPath => {
                if (!openPath) return;
                this.$store.commit('setProjectPath', openPath);
                this.$emit("update:modelValue", openPath);
                this.$store.commit('setLoading', true);
                readProject(openPath).then(projectData => {
                    console.log(projectData);
                    this.$store.commit('loadProject', projectData);
                    this.$store.commit('setLoading', false);
                })
            });
        },
    },

    watch: {
        modelValue() {
            if (this.modelValue && this.modelValue.length > 0) {
                this.modalVisible = false;
            }
        },
    },
};
</script>