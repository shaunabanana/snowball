<template>
    <Node title="Snowball" close
        :id="id"
        :loading="data.loading"
        :inputs="[
            { id: 'papers', type: 'papers', text: 'Papers', class: 'data' },
            {
                id: 'selection', type: 'selection',
                text: 'Selection: Only snowball from specific papers'
            },
        ]"
        :outputs="[
            { id: 'papers', type: 'papers', text: 'New papers', class: 'data' },
            { id: 'graph', type: 'graph', text: 'Graph: Relations among the snowballed papers', class: 'graph' },
            { id: 'citations', type: 'selection', text: 'Selection: All citations'},
            { id: 'references', type: 'selection', text: 'Selection: All references'}
        ]"
        :notes="data.notes"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Input papers">
                    {{ inputCount }}
                </a-descriptions-item>
                <a-descriptions-item label="New papers found">
                    {{ outputCount }}
                </a-descriptions-item>

                <a-descriptions-item label="Get citations">
                    <a-switch :model-value="data.getCitations" size="small" type="round" @change="update('getCitations', $event)"/>
                </a-descriptions-item>

                <a-descriptions-item label="Get references">
                    <a-switch :model-value="data.getReferences" size="small" type="round" @change="update('getReferences', $event)"/>
                </a-descriptions-item>

                <a-descriptions-item label="Include arXiv preprints">
                    <a-switch :model-value="data.includeArxiv" size="small" type="round" @change="update('includeArxiv', $event)"/>
                </a-descriptions-item>
            </a-descriptions>
        </a-space>

        <a-space direction="vertical" fill>
            <a-button size="small" type="primary" long
                @click="doSnowball"
            >
                Snowball
            </a-button>
        </a-space>
    </Node>
</template>

<script>
import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';
import { querySemanticScholar } from '@/utils/snowball';
import Node from './Node.vue';

export default {
    name: 'SnowballNode',
    components: {
        Node,
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    props: {
        id: String,
        data: Object,
    },

    data: () => ({
        inputCount: 0,
        outputCount: 0
    }),

    mounted() {
        const nodeData = this.store.workflowNode(this.id).data;
        nodeData.run = this.handleInput.bind(this);
        if (!this.data.getCitations) {
            nodeData.getCitations = false;
        }
        if (!this.data.getReferences) {
            nodeData.getReferences = false;
        }
        if (!this.data.includeArxiv) {
            nodeData.includeArxiv = false;
        }
        if (!this.data.papers) {
            nodeData.papers = [];
        }
        if (!this.data.graph) {
            nodeData.graph = [];
        }
        if (!this.data.citations) {
            nodeData.citations = [];
        }
        if (!this.data.references) {
            nodeData.references = [];
        }
        this.worker = new Worker(new URL('./workers/snowball.js', import.meta.url), {
            type: 'module',
        });
        this.handleInput();
    },

    methods: {
        update(key, value) {
            console.log("Update switch");
            this.store.workflowNode(this.id).data[key] = value;
            writeProject(this.store);
        },

        handleInput() {
            const workflowInput = this.store.dataflow.input[this.id];
            if (!workflowInput || !workflowInput.papers) {
                this.inputCount = 0;
            } else {
                let selectedPapers = workflowInput.papers;
                // If selection is specified, then filter input data using
                if (Array.isArray(workflowInput.selection)) {
                    selectedPapers = selectedPapers.filter(
                        (paper) => workflowInput.selection.includes(paper.id),
                    );
                }
                this.inputCount = selectedPapers.length;
            }
            
            this.outputCount = this.data.papers ? this.data.papers.length : 0;

            this.store.dataflow.output[this.id] = {
                papers: this.data.papers || [],
                graph: this.data.graph || [],
                citations: this.data.citations || [],
                references: this.data.references || [],
            };
            this.store.runWorkflow(this.id)
            writeProject(this.store);
        },

        doSnowball() {
            const nodeData = this.store.workflowNode(this.id).data;
            const workflowInput = this.store.dataflow.input[this.id];
            if (
                !workflowInput
                || !workflowInput.papers
            ) {
                this.papers = [];
                this.store.dataflow.output[this.id] = {};
                this.store.runWorkflow(this.id);
                return;
            }

            nodeData.loading = true;

            console.log(workflowInput);

            let selectedPapers = workflowInput.papers;
            // If selection is specified, then filter input data using
            if (Array.isArray(workflowInput.selection)) {
                selectedPapers = selectedPapers.filter(
                    (paper) => workflowInput.selection.includes(paper.id),
                );
            }

            const dois = selectedPapers.filter((p) => p.doi).map((p) => p.doi);

            console.log(dois);

            querySemanticScholar(
                dois, 
                this.data.getCitations, 
                this.data.getReferences, 
                this.data.includeArxiv
            ).then((results) => {
                console.log(results);
                nodeData.papers = results.papers;
                nodeData.graph = results.graph;
                nodeData.citations = results.citations;
                nodeData.references = results.references;

                nodeData.loading = false;
                this.handleInput();
            }).catch(() => {
                nodeData.loading = false;
            });
        },
    },

    computed: {
        snowballPapers() {
            if (
                !this.data.input
                    || !Array.isArray(this.data.input)
                    || this.data.input.length === 0
            ) return [];

            const input = this.data.input[0].concat(...this.data.input.slice(1));
            return input.filter(
                (paper) => paper.decision === 'include' && paper.doi,
            );
        },
    },

    watch: {
        'data.input': {
            deep: false,
            handler() {
                this.doSnowball();
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
