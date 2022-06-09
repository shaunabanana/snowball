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
import { appWindow } from '@tauri-apps/api/window';
import { trace, info, attachConsole } from 'tauri-plugin-log-api';

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
            detach: null
        };
    },

    methods: {
        addImportedPapers(papers) {
            trace(`Adding ${papers.length} new papers to sheet '${this.activeSheet}'.`);
            this.$store.commit("addPapers", {
                sheet: this.activeSheet,
                papers: papers,
            });
            trace(`Removing loading screen.`);
            this.$store.commit('setLoading', false);
        },

        includedPapers(sheet, forceDOI, forceNew) {
            const includedPapers = [];
            sheet.papers.forEach(paperId => {
                if (this.$store.state.papers[paperId] && this.$store.state.papers[paperId].include) {
                    if (forceDOI && this.$store.state.papers[paperId].doi) {
                        if (forceNew && this.$store.state.papers[paperId].sheets.length > 1) return;
                        includedPapers.push(this.$store.state.papers[paperId].doi);
                    } else if (!forceDOI) {
                        if (forceNew && this.$store.state.papers[paperId].sheets.length > 1) return;
                        includedPapers.push(this.$store.state.papers[paperId].id);
                    }
                }
            });
            trace(`Sheet '${sheet.name}' has ${includedPapers.length} included papers.`);
            return includedPapers;
        },

        snowball (sheet) {
            trace(`Showing loading screen.`);
            this.$store.commit('setLoading', true);
            const includedPapers = this.includedPapers(sheet, true, true);

            const newPapers = [];
            Promise.all(includedPapers.map(doi => querySemanticScholar(doi))).then(results => {
                results.forEach(result => {
                    result.citations.forEach(paper => newPapers.push(paper));
                    result.references.forEach(paper => newPapers.push(paper));
                });
                const sheetId = `layer-${Object.keys(this.$store.state.sheets).length}`;
                const sheetName = `Layer ${Object.keys(this.$store.state.sheets).length}`;
                trace(`Adding new sheet (${sheetId}) named '${sheetName}'.`);
                this.$store.commit('addSheet', {id: sheetId, name: sheetName, papers: []});
                trace(`Setting active sheet to '${sheetId}'.`);
                this.activeSheet = sheetId;
                this.addImportedPapers(newPapers);

                info(`Snowballing finished for ${newPapers.length} papers.`);
            });
            
        }
    },

    mounted() {
        attachConsole().then(detach => {
            this.detach = detach;
            trace('Logger attached to WebView.');
        })
    },

    beforeUnmount () {
        this.detach();
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
            const fileName = this.projectPath.split('\\').pop().split('/').pop();
            appWindow.setTitle(`${fileName} - Snowball`);
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
