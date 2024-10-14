<template>
    <Node title="Boolean Operation" close
        :id="id"
        :loading="data.loading"
        :inputs="[
            { id: 'selection1', type: 'selection', text: 'Selection: A selection of papers to be intersected with another'},
            { id: 'selection2', type: 'selection', text: 'Selection: A selection of papers to be intersected with another'},
        ]"
        :outputs="[
            { id: 'selection', type: 'selection', text: 'Selection: Intersection of the two selections'},
        ]"
        :notes="data.notes"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Operation">
                    <a-select size="small"
                        default-value="union"
                        :model-value="data.operation"
                        @change="updateOperation"
                    >
                        <a-option value="union">Union</a-option>
                        <a-option value="difference">Difference</a-option>
                        <a-option value="intersection">Intersection</a-option>
                    </a-select>
                </a-descriptions-item>

                <!-- <a-descriptions-item label="Selection 1">
                    {{ taggedCount }}
                </a-descriptions-item>

                <a-descriptions-item label="Selection 2">
                    {{ taggedCount }}
                </a-descriptions-item> -->

                <a-descriptions-item label="Output">
                    {{ selection.length }}
                </a-descriptions-item>
            </a-descriptions>
        </a-space>
    </Node>
</template>

<script>
// import { nanoid } from 'nanoid';
import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';
import Node from './Node.vue';

export default {
    name: 'IntersectNode',
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
            selection: []
        };
    },

    mounted() {
        const nodeData = this.store.workflowNode(this.id).data;
        nodeData.run = this.handleInput.bind(this);
        if (!this.data.operation) {
            nodeData.operation = 'union';
        }
        this.worker = new Worker(new URL('./workers/boolean.js', import.meta.url), {
            type: 'module',
        });
        this.handleInput();
    },

    methods: {

        update(key, value) {
            this.store.workflowNode(this.id).data[key] = value;
        },

        updateOperation(value) {
            const nodeData = this.store.workflowNode(this.id).data;
            nodeData.operation = value.toLowerCase();
            writeProject(this.store);
            this.handleInput();
        },

        handleInput() {
            console.log(this.data);
            if (
                !this.store.dataflow.input[this.id]
                || !this.store.dataflow.input[this.id].selection1
                || !this.store.dataflow.input[this.id].selection2
                || !this.data.operation
                || this.data.operation.length === 0
            ) {
                this.store.dataflow.output[this.id] = {};
                this.store.runWorkflow(this.id);
                return;
            }

            const nodeData = this.store.workflowNode(this.id).data;

            nodeData.loading = true;

            const nodeInput = this.store.dataflow.input[this.id];

            this.worker.postMessage(JSON.stringify({
                selection1: nodeInput.selection1,
                selection2: nodeInput.selection2,
                operation: this.data.operation
            }));
            this.worker.onmessage = ({ data }) => {
                this.store.dataflow.output[this.id] = data
                this.selection = data.selection

                console.log(`[Boolean@${this.id}][handleInput] Done.`);
                nodeData.loading = false;

                this.store.runWorkflow(this.id);
                writeProject(this.store);
            };
            this.worker.onerror = (error) => {
                console.log('Error performing boolean.', error);
                this.$message.error(error.message);
                this.error = true;
                nodeData.loading = false;
            };
        },
    },

    // computed: {
    //     taggedCount() {
    //         return this.store.dataflow.output[this.id]
    //             && this.store.dataflow.output[this.id].tagged
    //             && Array.isArray(this.store.dataflow.output[this.id].tagged)
    //             ? this.store.dataflow.output[this.id].tagged.length
    //             : 'N/A';
    //     },
    // },
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
