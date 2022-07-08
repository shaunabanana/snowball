<template>
    <a-layout style="overflow: hidden" ref="mainContainer" id="main-container">
        <a-layout-header style="padding-left: 20px">
            <Tabs />
        </a-layout-header>
        <a-layout style="padding: 0 0 0 24px">
            <a-layout-content>
                <a-space direction="vertical" fill
                    style="height: 100%; padding-right: 1rem; margin-bottom: 1rem"
                >
                    <Toolbar @snowball="snowball"/>
                    <ScreeningView
                        v-if="$store.getters.currentSheet.papers.length !== 0"
                        :height="height"
                    />
                    <FileLoader
                        v-if="$store.getters.currentSheet.papers.length === 0"
                        @import="addImportedPapers"
                    />
                </a-space>
            </a-layout-content>
            <!-- <a-layout-footer>Footer</a-layout-footer> -->
        </a-layout>
    </a-layout>
</template>

<script>
import Tabs from '@/components/papers/Tabs.vue';
import Toolbar from '@/components/papers/Toolbar.vue';
import ScreeningView from '@/components/papers/ScreeningView.vue';
import FileLoader from '@/components/papers/FileLoader.vue';

import querySemanticScholar from '@/utils/literature';

export default {
    name: 'PapersScreen',
    components: {
        Tabs,
        Toolbar,
        ScreeningView,
        FileLoader,
    },

    // props: {
    //     data: Array,
    // },

    data() {
        return {
            height: 600,
        };
    },

    methods: {
        addImportedPapers(papers) {
            console.log(`[PapersScreen][addImportedPapers] Adding ${papers.length} new papers to sheet '${this.$store.state.activeSheet}'.`);
            this.$store.commit('addPapers', {
                sheet: this.$store.state.activeSheet,
                papers,
            });
        },

        snowball() {
            this.$store.commit('setLoading', true);
            const includedPapers = this.$store.getters.activeIncludedPapers;

            const newPapers = [];
            Promise.all(
                includedPapers.map((paper) => querySemanticScholar(paper.doi)),
            ).then((results) => {
                results.forEach((result) => {
                    result.citations.forEach((paper) => newPapers.push(paper));
                    result.references.forEach((paper) => newPapers.push(paper));
                });
                const sheetId = `layer-${Object.keys(this.$store.state.sheets).length}`;
                const sheetName = `Layer ${Object.keys(this.$store.state.sheets).length}`;
                console.log(`[PapersScreen][snowball] Adding new sheet (${sheetId}) named '${sheetName}'.`);
                this.$store.commit('addSheet', {
                    id: sheetId, name: sheetName, papers: [], preventCommit: true,
                });
                console.log(`[PapersScreen][snowball] Setting active sheet to '${sheetId}'.`);
                this.$store.commit('setActiveSheet', sheetId);
                this.addImportedPapers(newPapers);

                console.info(`[PapersScreen][snowball] Snowballing finished for ${newPapers.length} papers.`);
            });
        },
    },

    mounted() {
        this.height = this.$refs.mainContainer.$el.offsetHeight - 20;
        this.tableHeight = this.height * this.tableSize + 29;
        const resizeObserver = new ResizeObserver((events) => {
            events.forEach((event) => {
                if (event.target.id !== 'main-container') return;
                this.height = event.contentRect.height - 90;
            });
        });
        resizeObserver.observe(this.$refs.mainContainer.$el);
    },
};
</script>

<style scoped>
.table-container {
    overflow: hidden;
}

.arco-split-trigger-icon-wrapper {
    background-color: white !important;
}
</style>
