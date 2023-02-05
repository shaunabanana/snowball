<template>
    <Node title="Screen in sheet" close
        :id="id"
        :loading="data.loading"
        :inputs="[
            { id: 'papers', type: 'papers', text: 'Papers', class: 'data' },
            { id: 'selection', type: 'papers', text: 'Selection: Only show specific papers' },
        ]"
        :outputs="[
            { id: 'papers', type: 'papers', text: 'Papers', class: 'data' },
            { id: 'sheet', text: 'Selection: All papers in sheet' },
            { id: 'included', text: 'Selection: Included papers' },
            { id: 'excluded', text: 'Selection: Excluded papers' },
            { id: 'undecided', text: 'Selection: Undecided papers' },
        ]"
        :notes="data.notes"
        :edit="!!this.data.sheet"
        @change="updateSheetName"
    >
        <a-space direction="vertical">
        <a-descriptions size="small" :column="1">
            <a-descriptions-item label="Sheet name">
                <a-input
                    size="small"
                    placeholder="Sheet name"
                    :model-value="data.name"
                    @input="updateSheetName"
                    @keydown.stop
                    @mousedown.stop
                />
            </a-descriptions-item>

            <a-descriptions-item label="Screening records">
                {{ data.edits ? Object.keys(data.edits).length : 0 }}
            </a-descriptions-item>

            <a-descriptions-item label="Papers in sheet">
                {{ papers.length }}
            </a-descriptions-item>

            <a-descriptions-item label="Included">
                {{ included.length }}
            </a-descriptions-item>

            <a-descriptions-item label="Excluded">
                {{ excluded.length }}
            </a-descriptions-item>
        </a-descriptions>

        <!-- <a-space direction="vertical">
            <a-button
            size="small"
            type="primary"
            long
            :disabled="data.location"
            >
                Screen papers
            </a-button>
        </a-space> -->
        </a-space>
    </Node>
</template>

<script>
// import { nanoid } from 'nanoid';
import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';
import Node from './Node.vue';

export default {
    name: 'SheetNode',
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
            papers: [],
        };
    },

    mounted() {
        const nodeData = this.store.workflowNode(this.id).data;
        nodeData.run = this.handleInput.bind(this);
        if (!this.data.name) {
            nodeData.name = 'New Sheet';
        }
        if (!this.data.edits) {
            nodeData.edits = {};
        }
        this.worker = new Worker(new URL('./workers/sheet.js', import.meta.url));

        this.store.activeSheet = this.id;
        this.handleInput();
    },

    methods: {

        updateSheetName(value) {
            this.store.workflowNode(this.id).data.name = value;
        },

        handleInput() {
            const workflowInput = this.store.dataflow.input[this.id];
            const nodeData = this.store.workflowNode(this.id).data;
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

            this.worker.postMessage(JSON.stringify({
                papers: this.store.dataflow.input[this.id].papers,
                selection: workflowInput.selection,
                edits: this.data.edits,
            }));
            this.worker.onmessage = ({ data }) => {
                this.papers = data.papers;
                this.store.dataflow.output[this.id] = data.output;
                nodeData.loading = false;
                console.log(`[Sheet@${this.id}][handleInput] Sheet has ${this.papers.length} papers. Applied ${Object.keys(this.data.edits).length} edits.`);

                this.store.runWorkflow(this.id);
                writeProject(this.store);
            };
            this.worker.onerror = (error) => {
                console.log('Error displaying sheet.', error);
                this.$message.error(error.message);
                nodeData.loading = false;
            };
        },
    },

    computed: {
        included() {
            return this.papers.filter((paper) => paper.decision === 'include');
        },

        excluded() {
            return this.papers.filter((paper) => paper.decision === 'exclude');
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
