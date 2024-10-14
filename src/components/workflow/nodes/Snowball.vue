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
        ]"
        :notes="data.notes"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Input papers">
                    {{ data.input ? snowballPapers.length : 'N/A' }}
                </a-descriptions-item>
                <a-descriptions-item label="Snowball-able (has DOI)">
                    {{ data.input ? snowballPapers.length : 'N/A' }}
                </a-descriptions-item>
                <a-descriptions-item label="New papers found">
                    {{ data.output ? data.output.length : 'N/A' }}
                </a-descriptions-item>

                <a-descriptions-item label="Forward citations">
                    <a-switch size="small" type="round"/>
                </a-descriptions-item>

                <a-descriptions-item label="Backward citations">
                    <a-switch size="small" type="round"/>
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
import { queryOpenAlex } from '@/utils/snowball';
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

    mounted() {
        const nodeData = this.store.workflowNode(this.id).data;
        // nodeData.run = this.doSnowball.bind(this);
        if (!this.data.forward) {
            nodeData.forward = true;
        }
        if (!this.data.backward) {
            nodeData.forward = true;
        }
        if (!this.data.limit) {
            nodeData.limit = ['keywords', ''];
        }
        if (!this.data.sort) {
            nodeData.sort = ['keywords', ''];
        }
        this.worker = new Worker(new URL('./workers/snowball.js', import.meta.url), {
            type: 'module',
        });
    },

    methods: {
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

            queryOpenAlex(dois, this.store.user);

            nodeData.loading = false;

            // // Do things
            // // const inputIds = input.map((paper) => paper.id);
            // const includedPapers = input.filter(
            //     (paper) => paper.decision === 'include' && paper.doi,
            // );

            // const includedIds = includedPapers.map((paper) => paper.doi);
            // queryOpenAlex(includedIds, this.$store.state.user);

            // const newPapers = [];
            // Promise.all(
            //     includedPapers.map((paper) => queryOpenAlex(paper.doi, this.$store.state.user)),
            // ).then((results) => {
            //     results.forEach((result) => {
            //         result.citations.forEach((paper) => {
            //             if (!includedIds.includes(paper.id)) { newPapers.push(paper); }
            //         });
            //         result.references.forEach((paper) => {
            //             if (!includedIds.includes(paper.id)) { newPapers.push(paper); }
            //         });
            //     });

            //     console.info(`[PapersScreen][snowball]
            //     Snowballing finished for ${newPapers.length} papers.`);

            //     this.$emit('loading', false);

            //     this.$store.commit('updateWorkflow', {
            //         element: this.id,
            //         updates: {
            //             output: newPapers,
            //         },
            //     });
            //     this.$store.commit('triggerWorkflow', this.id);
            // });
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
