<template>
    <!-- <a-tabs size="medium" editable show-add-button
        :default-active-key="$store.state.activeSheet"
        :active-key="$store.state.activeSheet"
        @add="newEmptySheet"
        @delete="deleteSheet"
        @change="$store.commit('setActiveSheet', $event)"
    > -->
    <a-tabs size="medium"
        @delete="showWarning"
        :default-active-key="store.activeSheet"
        :active-key="store.activeSheet"
        @change="store.activeSheet = $event"
    >
        <!-- <a-tab-pane :disabled="$store.getters.currentSheet.papers.length === 0"
            :closable="false"
        >
            <template #title><icon-star/>
                All
                ({{Object.keys($store.state.papers).length}})
            </template>
        </a-tab-pane> -->
        <a-tab-pane v-for="sheet of store.sheets" :key="sheet.id">
            <template #title>
                <a-typography-paragraph
                    v-model:editText="sheet.data.name"
                    style="margin-bottom: 0"
                    :editable="sheet.id !== 'core' && sheet.id === store.activeSheet"
                    @edit-end="store.workflowNode(sheet.id).data.name = sheet.data.name"
                >
                    <!-- {{ sheet.data.name }} ({{sheet.papers.length}}) -->
                    {{ sheet.data.name }}
                </a-typography-paragraph>
            </template>
        </a-tab-pane>
    </a-tabs>
</template>

<script>
import useSnowballStore from '@/store';

export default {
    name: 'PaperTabs',
    components: {},
    setup: () => ({
        store: useSnowballStore(),
    }),

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

        showWarning(sheetId) {
            this.$modal.warning({
                title: `Delete "${this.$store.state.sheets[sheetId].name}"?`,
                content: 'Papers contained only in this sheet will be deleted, along with your tags and notes. Papers that are also in other sheets will remain untouched.',
                onOk: () => this.deleteSheet(sheetId),
                hideCancel: false,
                okText: 'Delete',
                cancelText: 'Cancel',
            });
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
                                sheets: newSheets,
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

    computed: {
        sheets() {
            return this.$store.state.workflow.filter((el) => el.type === 'sheet');
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
