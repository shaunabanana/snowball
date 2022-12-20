<template>
    <Node title="Export Papers" input close :id="id" :notes="data.notes" @delete="deleteNode">
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Format">
                    <a-select size="small"
                        default-value="RIS"
                        :model-value="data.format"
                        @change="updateFormat"
                    >
                        <a-option>RIS</a-option>
                        <a-option>BibTeX</a-option>
                        <a-option>CSV</a-option>
                    </a-select>
                </a-descriptions-item>
                <a-descriptions-item label="Location">
                    {{data.location ? data.location : 'Not set.'}}
                </a-descriptions-item>
            </a-descriptions>

            <a-space>
                <a-button size="small" :type="data.location ? 'secondary' : 'primary'"
                    @click="setSaveLocation"
                >
                    Set location
                </a-button>
                <a-button size="small" :type="data.location ? 'primary' : 'secondary'"
                    :disabled="!data.location"
                    @click="doExport"
                >
                    Save
                </a-button>
            </a-space>
        </a-space>
    </Node>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { writeFile } from 'fs/promises';

import { exportRIS, exportBibTeX, exportCSV } from '@/utils/export';
import Node from './Node.vue';

export default {
    name: 'ExportSheet',
    components: {
        Node,
    },

    props: {
        id: String,
        data: Object,
    },

    mounted() {
        this.$store.commit('updateWorkflow', {
            element: this.id,
            updates: {
                format: 'RIS',
            },
        });
    },

    methods: {
        deleteNode() {
            console.log('delete');
        },

        updateFormat(value) {
            this.$store.commit('updateWorkflow', {
                element: this.id,
                updates: {
                    format: value,
                    location: null,
                },
            });
        },

        setSaveLocation() {
            let extension;
            if (this.data.format.toLowerCase() === 'ris') {
                extension = 'ris';
            } else if (this.data.format.toLowerCase() === 'bibtex') {
                extension = 'bib';
            } else if (this.data.format.toLowerCase() === 'csv') {
                extension = 'csv';
            }
            ipcRenderer.invoke('export', extension).then((filePath) => {
                if (!filePath) return;
                console.log(`[ExportSheet][setSaveLocation] Set location to ${filePath}`);
                this.$store.commit('updateWorkflow', {
                    element: this.id,
                    updates: {
                        location: filePath,
                    },
                });
            });
        },

        doExport() {
            if (
                !this.data.input
                    || !Array.isArray(this.data.input)
                    || this.data.input.length === 0
            ) return;
            if (!this.data.format || !this.data.location) return;

            const input = this.data.input[0].concat(...this.data.input.slice(1));

            this.$emit('loading', true);

            console.log(`[PapersScreen][exportSheet] Exporting ${input.length} papers in ${this.data.format} format.`);
            let fileContent;
            if (this.data.format.toLowerCase() === 'ris') {
                fileContent = exportRIS(
                    this.$store.state,
                    this.$store.getters.currentSheet.papers,
                );
            } else if (this.data.format.toLowerCase() === 'bibtex') {
                fileContent = exportBibTeX(
                    this.$store.state,
                    this.$store.getters.currentSheet.papers,
                );
            } else if (this.data.format.toLowerCase() === 'csv') {
                fileContent = exportCSV(
                    this.$store.state,
                    this.$store.getters.currentSheet.papers,
                );
            }
            if (!fileContent) console.log(`[PapersScreen][exportSheet] Called with invalid format ${this.data.format}!`);

            writeFile(this.data.location, fileContent, {
                encoding: 'utf8',
            }).then(() => {
                this.$message.success(`Successfully exported to ${this.data.location}.`);
            }).catch((error) => {
                this.$message.error(`Failed to write file ${this.data.location}! ${error.message}`);
                console.log(`[PapersScreen][exportSheet] Failed to write file ${this.data.location}! ${error.message}`);
            });

            this.$emit('loading', false);
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
