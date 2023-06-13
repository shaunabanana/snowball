<template>
    <Node title="Run custom script" output close
        :id="id"
        :loading="data.loading"
        :notes="data.notes"
        :inputs="[
            { id: 'papers', text: 'Papers', type: 'papers', class: 'data' },
            { id: 'selection', text: 'Selection: Only process specific papers', type: 'selection' },
        ]"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Format">
                    <a-select size="small"
                        default-value="ris"
                        :model-value="data.format"
                        @change="updateFormat"
                    >
                        <a-option value="ris">RIS</a-option>
                        <a-option value="bib">BibTeX</a-option>
                        <a-option value="csv">CSV</a-option>
                    </a-select>
                </a-descriptions-item>
                <a-descriptions-item label="Location">
                    {{data.path ? data.path : 'Not set.'}}
                </a-descriptions-item>
            </a-descriptions>

            <a-space>
                <a-button size="small" :type="data.path ? 'secondary' : 'primary'"
                    @click="setSaveLocation"
                >
                    Load script
                </a-button>
                <a-button size="small" :type="data.path ? 'primary' : 'secondary'"
                    :disabled="!data.path"
                    @click="handleInput"
                >
                    Edit script
                </a-button>
                <a-button size="small" :type="data.path ? 'primary' : 'secondary'"
                    :disabled="!data.path"
                    @click="handleInput"
                >
                    Run
                </a-button>
            </a-space>
        </a-space>
    </Node>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { writeFile } from 'fs/promises';
import { relative, dirname, join } from 'path';

import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';
import { exportRIS, exportBibTeX, exportCSV } from '@/utils/export';
import Node from './Node.vue';

export default {
    name: 'RunScript',
    components: {
        Node,
    },
    props: {
        id: String,
        data: Object,
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    mounted() {
        const nodeData = this.store.workflowNode(this.id).data;
        nodeData.run = this.handleInput.bind(this);
        if (!this.data.format) {
            nodeData.format = 'ris';
        }
        this.worker = new Worker(new URL('./workers/export.js', import.meta.url), {
            type: 'module',
        });
        this.handleInput();
    },

    methods: {
        updateFormat(value) {
            const nodeData = this.store.workflowNode(this.id).data;
            nodeData.format = value.toLowerCase();
            writeProject(this.store);
        },

        setSaveLocation() {
            ipcRenderer.invoke('export', this.data.format).then((filePath) => {
                if (!filePath) return;
                console.log(`[ExportSheet][setSaveLocation] Set location to ${filePath}`);
                const nodeData = this.store.workflowNode(this.id).data;
                const fileName = filePath.replace(new RegExp(`.${this.data.format}$`), '');
                const project = dirname(this.store.projectPath);
                const location = relative(project, fileName);
                nodeData.path = location;
                writeProject(this.store);
                this.handleInput();
            });
        },

        handleInput() {
            const nodeData = this.store.workflowNode(this.id).data;
            const workflowInput = this.store.dataflow.input[this.id];
            if (
                !workflowInput
                || !workflowInput.papers
                || !this.data.path
            ) {
                this.papers = [];
                return;
            }

            nodeData.loading = true;

            console.log(workflowInput);

            let selectedPapers = workflowInput.papers;
            // If selection is specified, then filter input data using
            if (workflowInput.selection && workflowInput.selection.length > 0) {
                selectedPapers = selectedPapers.filter(
                    (paper) => workflowInput.selection.includes(paper.id),
                );
            }

            console.log(selectedPapers);

            console.log(`[PapersScreen][exportSheet] Exporting ${selectedPapers.length} papers in ${this.data.format} format.`);
            let fileContent;
            if (this.data.format === 'ris') {
                fileContent = exportRIS(selectedPapers);
            } else if (this.data.format === 'bib') {
                fileContent = exportBibTeX(selectedPapers);
            } else if (this.data.format === 'csv') {
                fileContent = exportCSV(selectedPapers);
            }
            if (!fileContent) console.log(`[PapersScreen][exportSheet] Called with invalid format ${this.data.format}!`);

            const savePath = join(
                dirname(this.store.projectPath),
                `${this.data.path}.${this.data.format}`,
            );
            writeFile(savePath, fileContent, {
                encoding: 'utf8',
            }).then(() => {
                this.$message.success(`Successfully exported to ${savePath}.`);
            }).catch((error) => {
                this.$message.error(`Failed to write file ${savePath}! ${error.message}`);
                console.log(`[PapersScreen][exportSheet] Failed to write file ${savePath}! ${error.message}`);
            });

            nodeData.loading = false;
        },
    },

    watch: {
        'data.input': {
            deep: false,
            handler() {
                this.doExport();
            },
        },
    },
};
</script>

<style scoped>
.node {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content:
    center; max-width: 90%;
    margin: auto;
    gap: 3px
}
</style>
