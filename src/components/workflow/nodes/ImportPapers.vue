<template>
    <Node title="Import papers" output close
        :id="id"
        :notes="data.notes"
        :outputs="[{ id: 'output', text: 'Imported papers', class: 'data' }]"
        @delete="deleteNode"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="File">
                    {{ data.path ? fileName : 'Not set' }}
                </a-descriptions-item>
                <a-descriptions-item label="Location">
                    {{ data.path ? fileLocation : 'Not set' }}
                </a-descriptions-item>
                <a-descriptions-item label="Paper count">
                    {{ data.output && data.output.output ? data.output.output.length : 'N/A' }}
                </a-descriptions-item>
            </a-descriptions>

            <a-space fill>
                <a-button size="small" :type="data.path ? 'secondary' : 'primary'"
                    @click="openFile"
                >
                    Open
                </a-button>
                <a-button size="small" :type="data.path ? 'primary' : 'secondary'"
                    :disabled="!data.path"
                    @click="reload"
                >
                    Reload
                </a-button>
            </a-space>
        </a-space>
    </Node>
</template>

<script>
import { basename, dirname } from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';

import { processFile } from '@/utils/import';
import { updateAutoTags } from '@/utils/tags';
import useSnowballStore from '@/store';
import Node from './Node.vue';

export default {
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

    data() {
        return {
            fileList: [],
        };
    },

    methods: {
        formatPapers(papers) {
            papers.sort((a, b) => {
                if (typeof a.year === 'number' && typeof b.year === 'number') {
                    return b.year - a.year;
                }
                if (typeof a.year === 'string' && typeof b.year === 'number') {
                    return 1;
                }
                if (typeof a.year === 'number' && typeof b.year === 'string') {
                    return -1;
                }
                return 0;
            });

            const processed = papers.map((paperData) => {
                const paper = { ...paperData };
                paper.tags = [];
                paper.include = false;
                paper.decision = 'undecided';
                paper.notes = '';
                paper.comments = [];
                paper.sheets = [];
                return paper;
            });

            updateAutoTags(this.store, processed);
            return processed;
        },

        loadFile(filePath) {
            this.$emit('loading', true);
            processFile(filePath)
                .then((processed) => {
                    const nodeData = this.store.workflowNode(this.id).data;
                    nodeData.changed = true;
                    nodeData.path = filePath;
                    nodeData.output = { output: this.formatPapers(processed) };
                    this.store.runWorkflow(this.id);
                    this.$emit('loading', false);
                })
                .catch((error) => {
                    console.log('Error reading file.', error);
                    this.$message.error(error.message);
                    this.fileList = [];
                    this.$emit('loading', false);
                });
        },

        openFile() {
            ipcRenderer.invoke('open-file').then((filePath) => {
                if (!filePath) {
                    return;
                }
                this.loadFile(filePath[0]);
            });
        },

        reload() {
            if (!this.data.path) return;
            this.loadFile(this.data.path);
        },

        deleteNode() {
            console.log('delete');
        },
    },

    computed: {
        fileName() {
            return this.data.path ? basename(this.data.path) : null;
        },

        fileLocation() {
            return this.data.path ? dirname(this.data.path) : null;
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
