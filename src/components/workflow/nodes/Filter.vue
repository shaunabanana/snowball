<template>
    <Node title="Filter papers" close
        :id="id"
        :loading="data.loading"
        :inputs="[
            { id: 'papers', type: 'papers', text: 'Papers', class: 'data' },
            { id: 'selection', type: 'selection', text: 'Selection: Only search selected papers'},
        ]"
        :outputs="[
            { id: 'papers', type: 'papers', text: 'Papers', class: 'data'},
            { id: 'filtered', type: 'selection', text: 'Selection: Filter result'},
        ]"
        :notes="data.notes"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Method">
                    <a-radio-group type="button" size="small" default-value="boolean"
                        :model-value="data.method"
                        @change="update('method', $event)"
                    >
                        <a-radio value="boolean">Boolean</a-radio>
                        <a-radio value="regexp">RegExp</a-radio>
                    </a-radio-group>
                </a-descriptions-item>

                <a-descriptions-item label="Filter">
                    <a-textarea
                        size="small"
                        placeholder="Enter filter..."
                        :model-value="data.filter"
                        :error="error"
                        @input="update('filter', $event)"
                        @mousedown.stop
                        @keydown.stop
                        @keydown.enter.prevent
                    />
                </a-descriptions-item>

                <a-descriptions-item label="Additional Tags">
                    <a-input-tag size="small" allow-clear
                        :default-value="data.tags"
                        :style="{width:'320px'}"
                        placeholder="Please Enter"
                        @change="update('tags', $event)"
                        @keydown.stop
                    />
                </a-descriptions-item>

                <a-descriptions-item label="Paper count">
                    {{ papers.length }}
                </a-descriptions-item>

                <a-descriptions-item label="Filtered">
                    {{ filtered }}
                </a-descriptions-item>
            </a-descriptions>

            <a-button size="small" type="primary" long
                :disabled="
                    !store.dataflow.input[this.id] || !store.dataflow.input[this.id].papers
                "
                @click="handleInput"
            >
                Filter
            </a-button>

        </a-space>
    </Node>
</template>

<script>
// import { nanoid } from 'nanoid';
import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';
import Node from './components/Node.vue';

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
            error: false,
        };
    },

    mounted() {
        const nodeData = this.store.workflowNode(this.id).data;
        nodeData.run = this.handleInput.bind(this);
        if (!this.data.method) {
            nodeData.method = 'boolean';
        }
        if (!this.data.filter) {
            nodeData.filter = '';
        }
        if (!this.data.tags) {
            nodeData.tags = [];
        }
        this.worker = new Worker(new URL('./workers/filter.js', import.meta.url), {
            type: 'module',
        });
        this.handleInput();
    },

    methods: {
        update(key, value) {
            this.store.workflowNode(this.id).data[key] = value;
        },

        handleInput() {
            if (
                !this.store.dataflow.input[this.id] || !this.store.dataflow.input[this.id].papers
            ) {
                this.store.dataflow.output[this.id] = {};
                this.papers = [];
                this.store.runWorkflow(this.id);
                return;
            }
            const nodeData = this.store.workflowNode(this.id).data;

            nodeData.loading = true;

            this.papers = this.store.dataflow.input[this.id].papers;

            console.log(this.data.method, this.papers, this.data.filter);

            this.worker.postMessage(JSON.stringify({
                papers: this.papers,
                filter: this.data.filter,
                method: this.data.method,
                tags: this.data.tags,
                selection: this.store.dataflow.input[this.id].selection,
            }));
            this.worker.onmessage = ({ data }) => {
                this.store.dataflow.output[this.id] = {
                    papers: this.papers,
                    filtered: data.filtered,
                };

                console.log(`[Filter@${this.id}][handleInput] Input contains ${this.papers.length} papers. Filter result contains ${data.filtered.length} papers.`);
                nodeData.loading = false;
                this.error = false;

                this.store.runWorkflow(this.id);
                writeProject(this.store);
            };
            this.worker.onerror = (error) => {
                console.log('Error displaying sheet.', error);
                this.$message.error(error.message);
                this.error = true;
                nodeData.loading = false;
            };
        },
    },

    computed: {
        filtered() {
            return this.store.dataflow.output[this.id]
            && this.store.dataflow.output[this.id].filtered
                ? this.store.dataflow.output[this.id].filtered.length
                : 'N/A';
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
