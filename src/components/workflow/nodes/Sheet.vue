<template>
    <Node :id="id" title="Screen papers" close
        :inputs="[
            {id: 'data', text: 'Data', class: 'data'},
        ]"
        :outputs="[
            {id: 'data', text: 'Data', class: 'data' },
            {id: 'all', text: 'Selection: All', class: 'data' },
            {id: 'included', text: 'Selection: Included', class: 'data' },
            {id: 'excluded', text: 'Selection: Excluded', class: 'data' },
        ]"
        :notes="data.notes"
        :edit="!!this.data.sheet"
        @change="updateSheetName"
        @delete="deleteNode"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Sheet name">
                    <a-input size="small"
                        placeholder="Sheet name"
                        :model-value="data.name"
                        @input="updateSheetName"
                        @mousedown.stop
                    />
                </a-descriptions-item>

                <a-descriptions-item label="Paper count">
                    {{ papers.length }}
                </a-descriptions-item>

                <a-descriptions-item label="Included">
                    {{ included.length }}
                </a-descriptions-item>

                <a-descriptions-item label="Excluded">
                    {{ excluded.length }}
                </a-descriptions-item>

                <!-- <a-descriptions-item label="Unique papers only">
                    <a-switch type="round" size="small"/>
                </a-descriptions-item> -->
            </a-descriptions>

            <a-space direction="vertical">
                <a-button size="small" type="primary" long
                    :disabled="data.location"
                >
                    Screen papers
                </a-button>
            </a-space>
        </a-space>
    </Node>
</template>

<script>
// import { nanoid } from 'nanoid';
import useSnowballStore from '@/store';
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
            console.log(this);
        }
        this.store.activeSheet = this.id;
        this.handleInput();
    },

    methods: {
        deleteNode() {
            console.log('delete');
        },

        updateSheetName(value) {
            this.store.workflowNode(this.id).data.name = value;
        },

        handleInput() {
            if (
                !this.data.input || !this.data.input.data
            ) return;

            this.$emit('loading', true);

            this.papers = this.data.input.data;

            this.papers.forEach((paper, index) => {
                if (this.data.edits[paper.id]) {
                    this.papers[index] = {
                        ...paper,
                        ...this.data.edits[paper.id],
                    };
                }
            });
            console.log(this.papers);

            this.store.workflowNode(this.id).data.output = {
                data: this.papers,
                included: this.papers.filter((paper) => paper.decision === 'include'),
                excluded: this.papers.filter((paper) => paper.decision === 'exclude'),
                undecided: this.papers.filter((paper) => paper.decision === 'undecided'),
            };
            this.store.runWorkflow(this.id);
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

    watch: {
        'data.input': {
            deep: false,
            handler() {
                this.handleInput();
            },
        },

        'data.edits': {
            deep: false,
            handler() {
                this.handleInput();
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
