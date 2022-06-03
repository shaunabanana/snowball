<template>
    <el-tabs v-model="activeSheet" type="card" size="small">
        <el-tab-pane
            class="tab-pane"
            v-for="sheet in $store.state.sheets"
            :key="sheet.id"
            :label="sheet.name"
            :name="sheet.id"
        >
            <file-import
                v-if="sheet.papers.length === 0"
                @import="addImportedPapers"
            />
            <data-table v-if="sheet.papers.length > 0" :data="getPapersFromIds(sheet.papers)" />
        </el-tab-pane>
    </el-tabs>

    <project-screen v-model="projectPath" />
    <loading-screen :show="$store.state.loading" />
    
</template>

<script>
import { appWindow } from '@tauri-apps/api/window'

import FileImport from "@/components/FileImport.vue";
import DataTable from "@/components/DataTable.vue";
import ProjectScreen from "@/components/ProjectScreen.vue";
import LoadingScreen from "@/components/LoadingScreen.vue";

import { getTauriVersion } from "@tauri-apps/api/app";

export default {
    name: "App",
    components: {
        FileImport,
        DataTable,
        ProjectScreen,
        LoadingScreen
    },

    data() {
        return {
            showOpenScreen: true,
            projectPath: '',
            activeSheet: "foundation",
            filter: "",
            perPage: 100,
            currentPage: 1,
        };
    },

    methods: {
        addImportedPapers(papers) {
            console.log(papers);
            this.$store.commit("addPapers", {
                sheet: this.activeSheet,
                papers: papers,
            });
            this.$store.commit('setLoading', false);
        },

        getPapersFromIds(paperIds) {
            return paperIds.map(id => this.$store.state.papers[id]);
        }
    },

    mounted() {
        getTauriVersion().then((info) => {
            console.log(info);
        });
    },

    watch: {
        projectPath () {
            appWindow.setTitle(`${this.projectPath} - Snowball`);
        }
    },
};
</script>

<style>
html,
body {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
        "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.app {
    width: 100%;
    height: 100%;
}

.tab-pane {
    height: 100%;
}
</style>
