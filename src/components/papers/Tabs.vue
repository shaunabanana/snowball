<template>
    <!-- <a-tabs size="medium" editable show-add-button
        :default-active-key="$store.state.activeSheet"
        :active-key="$store.state.activeSheet"
        @add="newEmptySheet"
        @delete="deleteSheet"
        @change="$store.commit('setActiveSheet', $event)"
    > -->
    <a-tabs size="medium"
        :default-active-key="$store.state.activeSheet"
        :active-key="$store.state.activeSheet"
        @change="$store.commit('setActiveSheet', $event)"
    >
        <a-tab-pane :disabled="$store.getters.currentSheet.papers.length === 0">
            <template #title><icon-star/>All</template>
        </a-tab-pane>
        <a-tab-pane v-for="sheet of $store.state.sheets" :key="sheet.id"
            :closable="sheet.id !== 'core'"
        >
            <template #title>
                <a-typography-paragraph
                    v-model:editText="sheet.name"
                    style="margin-bottom: 0"
                    :editable="sheet.id !== 'core' && sheet.id === $store.state.activeSheet"
                    @edit-end="$store.commit('updateSheet', {
                        sheet: sheet.id,
                        updates: { name: sheet.name }
                    })"
                >
                    {{ sheet.name }} ({{sheet.papers.length}})
                </a-typography-paragraph>
            </template>
        </a-tab-pane>
    </a-tabs>
</template>

<script>
export default {
    name: 'PaperTabs',
    components: {},

    data() {
        return {
            activeSheet: 'core',
        };
    },

    methods: {
        newEmptySheet() {
            const sheetId = `layer-${Object.keys(this.$store.state.sheets).length}`;
            const sheetName = `Layer ${Object.keys(this.$store.state.sheets).length}`;
            console.log(`[PaperTabs][newEmptySheet] Adding new sheet (${sheetId}) named '${sheetName}'.`);
            this.$store.commit('addSheet', {
                id: sheetId, name: sheetName, papers: [],
            });
            console.log(`[PaperTabs][newEmptySheet] Setting active sheet to '${sheetId}'.`);
            this.$store.commit('setActiveSheet', sheetId);
        },

        deleteSheet(sheetId) {
            console.log(`[PaperTabs][deleteSheet] Deleting '${sheetId}'.`);
            this.$store.commit('setActiveSheet', 'core');
            Object.keys(this.$store.state.papers).forEach((paperId) => {
                const paper = this.$store.state.papers[paperId];
                if (paper.sheets.includes(sheetId)) {
                    const newSheets = paper.sheets.filter((t) => t !== sheetId);
                    if (newSheets.length > 0) {
                        this.$store.commit('updatePaper', {
                            paper: paper.id,
                            updates: {
                                tags: newSheets,
                            },
                            preventCommit: true,
                        });
                    } else {
                        this.$store.commit('deletePaper', paper.id);
                    }
                }
            });
            this.$store.commit('deleteSheet', sheetId);
        },
    },

    watch: {
        // eslint-disable-next-line func-names
        '$store.state.activeSheet': function () {
            this.activeSheet = this.$store.state.activeSheet;
        },
    },
};
</script>

<style lang="scss"></style>
