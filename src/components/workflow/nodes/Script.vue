<template>
    <Node title="Run custom script" output close
        :id="id"
        :loading="data.loading"
        :notes="data.notes"
        :inputs="data.inputs"
        :outputs="data.outputs"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Location">
                    {{ fileName }}
                </a-descriptions-item>
            </a-descriptions>

            <a-space>
                <a-button size="small" :type="data.path ? 'secondary' : 'primary'"
                    @click="setScriptLocation"
                >
                    Load script
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
import { readFile } from 'fs/promises';
import { relative, dirname, join } from 'path';

import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';
import { exportRIS, exportBibTeX, exportCSV } from '@/utils/export';
import Node from './components/Node.vue';

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
        this.worker = new Worker(new URL('./workers/script.js', import.meta.url));

        if (!this.data.path) {
            nodeData.path = null;
        }
        if (!this.data.inputs) {
            nodeData.inputs = [];
        }
        if (!this.data.outputs) {
            nodeData.outputs = [];
        }
        this.handleInput(true);
    },

    computed: {
        fileName() {
            const nodeData = this.store.workflowNode(this.id).data;
            if (nodeData.path) {
                return nodeData.path.length > 30
                    ? `${nodeData.path.slice(0, 15)}...${nodeData.path.slice(-15)}`
                    : nodeData.path;
            }
            return "Not set."
        }
    },

    methods: {
        updateFormat(value) {
            const nodeData = this.store.workflowNode(this.id).data;
            nodeData.format = value.toLowerCase();
            writeProject(this.store);
        },

        setScriptLocation() {
            ipcRenderer.invoke('import', "js").then((filePath) => {
                if (!filePath) return;
                console.log(`[ScriptNode][setScriptLocation] Set location to ${filePath}`);
                const nodeData = this.store.workflowNode(this.id).data;
                nodeData.path = path;
                writeProject(this.store);
                this.handleInput();
            });
        },

        parseScript(path) {
            return new Promise((resolve, reject) => {
                const nodeData = this.store.workflowNode(this.id).data;
                readFile(path, { encoding: 'utf-8' }).then((content) => {
                    const moduleBlob = new Blob([content], { type: "text/javascript" })
                    const moduleUrl = window.URL.createObjectURL(moduleBlob);
                    import(moduleUrl).then((script) => {
                        nodeData.inputs = script.inputs;
                        nodeData.outputs = script.outputs;
                        const codeBlob = new Blob([script.run.toString()], { type: "text/javascript" })
                        const codeUrl = window.URL.createObjectURL(codeBlob);
                        resolve(codeUrl);
                    });
                })
            })
        },

        handleInput(skipAutoRun) {
            const nodeData = this.store.workflowNode(this.id).data;
            const workflowInput = this.store.dataflow.input[this.id];
            if (
                !workflowInput
                || !this.data.path
            ) {
                this.papers = [];
                return;
            }

            nodeData.loading = true;

            this.parseScript(nodeData.path).then((codeUrl) => {

                this.worker.onmessage = ({ data }) => {
                    console.log("Received from worker", data)
                    this.store.dataflow.output[this.id] = data;
                    nodeData.loading = false;
                    if (!skipAutoRun) this.store.runWorkflow(this.id);
                };
                this.worker.onerror = (error) => {
                    console.log('Error running script.', error);
                    this.$message.error(error.message);
                    nodeData.loading = false;
                };

                this.worker.postMessage(JSON.stringify({
                    data: workflowInput,
                    code: codeUrl
                }));
            })
        },
    }
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
