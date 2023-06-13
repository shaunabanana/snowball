<template>
    <Node title="Import papers" output close
        :id="id"
        :loading="data.loading"
        :notes="data.notes"
        :outputs="[{ id: 'papers', text: 'Imported papers', type: 'papers', class: 'data' }]"
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
                    {{
                        store.dataflow.output[this.id]
                        && store.dataflow.output[this.id].papers
                        ? store.dataflow.output[this.id].papers.length
                        : 'N/A'
                    }}
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
import {
    basename, dirname, join, relative,
} from 'path';
import { readFile } from 'fs/promises';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';

import { updateAutoTags } from '@/utils/tags';
import writeProject from '@/utils/persistence';
import useSnowballStore from '@/store';
import Node from './Node.vue';

export default {
    name: 'ImportPapers',
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
            worker: null,
            fileList: [],
        };
    },

    mounted() {
        this.store.workflowNode(this.id).data.run = this.reload.bind(this);
        this.worker = new Worker(new URL('./workers/import.js', import.meta.url), {
            type: 'module',
        });

        console.log('importing', this.data.path);

        if (this.data.path) {
            const filePath = join(dirname(this.store.projectPath), this.data.path);
            console.log('Importing', filePath);
            this.loadFile(filePath);
        }
    },

    methods: {
        loadFile(filePath) {
            const nodeData = this.store.workflowNode(this.id).data;
            nodeData.loading = true;
            readFile(filePath, 'utf-8').then((content) => {
                this.worker.postMessage({ content, preprocess: filePath.endsWith('.bib') });
                this.worker.onmessage = ({ data }) => {
                    // Update auto tags
                    updateAutoTags(this.store, data);
                    // Update node data
                    const project = dirname(this.store.projectPath);
                    const location = relative(project, filePath);
                    nodeData.path = location;
                    // Update output cache
                    this.store.dataflow.output[this.id] = { papers: data };
                    console.log(`[ImportPapers][loadFile] Imported ${data.length} papers from ${filePath}`);
                    // Stop loading animation
                    nodeData.loading = false;
                    // Trigger workflow
                    this.store.runWorkflow(this.id);
                    writeProject(this.store);
                };
                this.worker.onerror = (error) => {
                    console.log('Error reading file.', error);
                    this.$message.error(error.message);
                    this.fileList = [];
                    nodeData.loading = false;
                };
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
            if (!this.data.path) {
                this.store.dataflow.output[this.id] = {};
                this.store.runWorkflow(this.id);
                return;
            }
            this.loadFile(join(dirname(this.store.projectPath), this.data.path));
        },
    },

    computed: {
        fileName() {
            return this.data.path ? basename(this.data.path) : null;
        },

        fileLocation() {
            return this.data.path.length > 30
                ? `${this.data.path.slice(0, 15)}...${this.data.path.slice(-15)}`
                : this.data.path;
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
