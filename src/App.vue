<template>
    <el-tabs v-model="activeSheet" type="card" size="small">
        <el-tab-pane
            class="tab-pane"
            v-for="sheet in $store.state.sheets"
            :key="sheet.id"
            :label="`${sheet.name} (${includedPapers(sheet).length}/${sheet.papers.length})`"
            :name="sheet.id"
        />
    </el-tabs>
    <file-import
        v-if="currentSheet.papers.length === 0"
        @import="addImportedPapers"
    />
    <data-table v-if="currentSheet.papers.length > 0" 
        :data="currentPapers" 
        @snowball="snowball(currentSheet)"/>

    <project-screen v-model="projectPath" />
    <loading-screen :show="$store.state.loading" />
    
</template>

<script>
import { appWindow } from '@tauri-apps/api/window'
import { getTauriVersion } from "@tauri-apps/api/app";

import FileImport from "@/components/FileImport.vue";
import DataTable from "@/components/DataTable.vue";
import ProjectScreen from "@/components/ProjectScreen.vue";
import LoadingScreen from "@/components/LoadingScreen.vue";

import { querySemanticScholar } from '@/utils/literature';

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
            activeSheet: "core",
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

        includedPapers(sheet, forceDOI) {
            const includedPapers = [];
            sheet.papers.forEach(paperId => {
                if (this.$store.state.papers[paperId] && this.$store.state.papers[paperId].include) {
                    if (forceDOI && this.$store.state.papers[paperId].doi) {
                        includedPapers.push(this.$store.state.papers[paperId].doi);
                    } else if (!forceDOI) {
                        includedPapers.push(this.$store.state.papers[paperId].id);
                    }
                }
            });
            console.log(sheet.name, includedPapers);
            return includedPapers;
        },

        snowball (sheet) {
            this.$store.commit('setLoading', true);
            const includedPapers = this.includedPapers(sheet, true);

            const newPapers = [];
            Promise.all(includedPapers.map(doi => querySemanticScholar(doi))).then(results => {
                console.log("Snowballing result", results);
                results.forEach(result => {
                    result.citations.forEach(paper => newPapers.push(paper));
                    result.references.forEach(paper => newPapers.push(paper));
                });

                const sheetId = `layer-${Object.keys(this.$store.state.sheets).length}`;
                const sheetName = `Layer ${Object.keys(this.$store.state.sheets).length}`;
                this.$store.commit('addSheet', {id: sheetId, name: sheetName, papers: []});
                this.activeSheet = sheetId;
                this.addImportedPapers(newPapers);
                // console.log('Snowballing result', newPapers);
            });
            
        }
    },

    mounted() {
        getTauriVersion().then((info) => {
            console.log(info);
        });
    },

    computed: {
        currentSheet () {
            return this.$store.state.sheets[this.activeSheet];
        },

        currentPapers () {
            return this.currentSheet.papers.map(id => this.$store.state.papers[id]);
        }
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
    padding: 0.1rem;
}
</style>
