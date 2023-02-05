<template>
    <Node :id="id" title="Merge duplicate papers" output close
        :loading="data.loading"
        :inputs="inputHandles"
        :outputs="outputHandles"
        :notes="data.notes"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Paper count">
                    {{ total }}
                </a-descriptions-item>

                <a-descriptions-item label="Potential Duplicates">
                    {{ duplicates.length }}
                </a-descriptions-item>

                <a-descriptions-item label="Merged">
                    {{ mergedCount ? mergedCount : 0 }}
                </a-descriptions-item>

                <a-descriptions-item label="Output count">
                    {{
                        this.store.dataflow.output[this.id]
                        && this.store.dataflow.output[this.id].papers
                            ? this.store.dataflow.output[this.id].papers.length
                            : 'N/A'
                    }}
                </a-descriptions-item>

                <a-descriptions-item label="Threshold">
                    <a-slider size="mini" style="width: 200px" show-input
                        :default-value="data.threshold ? data.threshold : 0.01"
                        :min="0"
                        :max="0.2"
                        :step="0.01"
                        @mousedown.stop
                        @change="updateThreshold"
                    />
                </a-descriptions-item>

                <!-- <a-descriptions-item label="Unique papers only">
                    <a-switch type="round" size="small"/>
                </a-descriptions-item> -->
            </a-descriptions>

            <a-space direction="vertical" fill>
                <a-button size="small" type="primary" long
                    :disabled="duplicates.length === 0"
                    @click="modal = true"
                >
                    Resolve Duplicates
                </a-button>
                <DuplicateList
                    :visible="modal"
                    :duplicates="duplicates"
                    :merges="data.merges"
                    @merge="handleMerge"
                    @close="modal = false"
                />
            </a-space>
        </a-space>
    </Node>
</template>

<script>

import debounce from '@/utils/debounce';
import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';

import Node from './Node.vue';
import DuplicateList from './components/DuplicateList.vue';

export default {
    name: 'MergeNode',
    components: {
        Node,
        DuplicateList,
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
            duplicates: [],
            total: 0,
            mergedCount: 0,
            modal: false,
            columns: [
                {
                    title: 'DOI',
                    dataIndex: 'doi',
                },
                {
                    title: 'Title',
                    dataIndex: 'title',
                },
                {
                    title: 'Abstract',
                    dataIndex: 'abstract',
                },
            ],
        };
    },

    created() {
        this.updateThreshold = debounce((value) => {
            this.store.workflowNode(this.id).data.threshold = value;
            this.handleInput();
        }, 300);
    },

    mounted() {
        const nodeData = this.store.workflowNode(this.id).data;
        nodeData.run = this.handleInput.bind(this);
        if (!this.data.threshold) {
            nodeData.changed = true;
            nodeData.threshold = 0.01;
        }
        if (!this.data.merges) {
            nodeData.changed = true;
            nodeData.merges = {};
        }
        this.worker = new Worker(new URL('./workers/merge.js', import.meta.url));
    },

    methods: {
        handleInput() {
            const nodeData = this.store.workflowNode(this.id).data;
            const workflowInput = this.store.dataflow.input[this.id];
            console.log(workflowInput);
            if (!workflowInput || Object.keys(workflowInput).length === 0) {
                this.duplicates = [];
                this.total = 0;
                this.mergedCount = 0;
                this.store.dataflow.output[this.id] = {};
                this.store.runWorkflow(this.id);
                return;
            }

            nodeData.loading = true;

            this.duplicates = [];

            this.worker.postMessage({
                command: 'handleInput',
                payload: JSON.stringify({
                    input: workflowInput,
                    threshold: this.data.threshold,
                    merges: this.data.merges,
                    paperHandles: this.paperHandles,
                }),
            });

            this.worker.onmessage = ({
                data: {
                    total, duplicates, output, mergedCount,
                },
            }) => {
                console.log(total, duplicates, output, mergedCount);
                this.duplicates = duplicates;
                this.mergedCount = mergedCount;
                this.total = total;

                this.store.dataflow.output[this.id] = output;

                nodeData.loading = false;

                this.store.runWorkflow(this.id);
                writeProject(this.store);
            };
        },

        handleMerge(mergeGroups) {
            mergeGroups.forEach(({ merge, group }) => {
                console.log(merge, group);

                const { merges } = this.store.workflowNode(this.id).data;
                if (merge) {
                    group.papers.forEach((paper) => {
                        const others = group.papers.filter((p) => p !== paper).map((p) => p.id);
                        if (!merges[paper.id]) merges[paper.id] = [];
                        merges[paper.id] = [...new Set(merges[paper.id].concat(others))];
                    });
                } else {
                    group.papers.forEach((paper) => {
                        const others = group.papers.filter((p) => p !== paper).map((p) => p.id);
                        if (!merges[paper.id]) return;
                        merges[paper.id] = merges[paper.id].filter((pid) => !others.includes(pid));
                        if (merges[paper.id].length === 0) delete merges[paper.id];
                    });
                }
            });

            this.handleInput();
        },
    },

    computed: {
        paperHandles() {
            const inEdges = this.store.inEdges(this.id);
            inEdges.forEach((edge, index) => {
                // eslint-disable-next-line no-param-reassign
                edge.targetHandle = `__papers_port${index}`;
            });
            const handles = Array(inEdges.length).fill(1).map((_, index) => ({
                id: `port${index}`,
                type: 'papers',
                text: 'Papers to merge',
                class: 'data',
            }));
            return handles;
        },

        inputHandles() {
            const handles = [...this.paperHandles];
            handles.push({
                id: `port${handles.length}`,
                type: 'papers',
                text: 'Papers to merge',
                class: 'data',
                style: { background: 'transparent !important' },
            });
            return handles;
        },

        outputHandles() {
            const handles = [{
                id: 'papers', type: 'papers', text: 'Merged papers', class: 'data',
            }];
            // this.paperHandles.forEach((handle, index) => {
            //     handles.push({
            //         id: `port${index}`,
            //         text: `Papers from input ${index + 1}`,
            //     });
            // });
            return handles;
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
