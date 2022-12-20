<template>
    <Node title="Snowball" input output close :id="id" :notes="data.notes" @delete="deleteNode">
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Snowball-able papers">
                    {{ data.input ? snowballPapers.length : 'N/A' }}
                </a-descriptions-item>
                <a-descriptions-item label="New papers found">
                    {{ data.output ? data.output.length : 'N/A' }}
                </a-descriptions-item>
            </a-descriptions>

            <a-space direction="vertical" fill>
                <a-button size="small" type="primary" long
                    :disabled="!data.input"
                    @click="doSnowball"
                >
                    Run
                </a-button>
            </a-space>
        </a-space>
    </Node>
</template>

<script>
import { queryOpenAlex } from '@/utils/literature';
import Node from './Node.vue';

export default {
    name: 'SnowballNode',
    components: {
        Node,
    },

    props: {
        id: String,
        data: Object,
    },

    methods: {
        doSnowball() {
            if (
                !this.data.input
                    || !Array.isArray(this.data.input)
                    || this.data.input.length === 0
            ) return;

            const input = this.data.input[0].concat(...this.data.input.slice(1));

            this.$emit('loading', true);

            // Do things
            // const inputIds = input.map((paper) => paper.id);
            const includedPapers = input.filter(
                (paper) => paper.decision === 'include' && paper.doi,
            );

            const includedIds = includedPapers.map((paper) => paper.doi);
            queryOpenAlex(includedIds, this.$store.state.user);

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

        deleteNode() {

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
