<template>
    <Node :id="id" title="Merge duplicates" input output close
        :notes="data.notes"
        @delete="deleteNode"
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
                    {{ data.merges ? data.merges.length : 'N/A' }}
                </a-descriptions-item>

                <a-descriptions-item label="Threshold">
                    <a-slider size="mini" style="width: 200px" show-input
                        :default-value="data.threshold ? data.threshold : 0.8"
                        :min="0.0"
                        :max="1.0"
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
                    :disabled="data.location"
                >
                    Resolve Duplicates
                </a-button>
            </a-space>
        </a-space>
    </Node>
</template>

<script>
import stringSimilarity from 'string-similarity';

import debounce from '@/utils/debounce';

import Node from './Node.vue';

export default {
    name: 'TagNode',
    components: {
        Node,
    },

    props: {
        id: String,
        data: Object,
    },

    data() {
        return {
            duplicates: [],
            total: 0,
        };
    },

    created() {
        this.updateThreshold = debounce((value) => {
            this.$store.commit('updateWorkflow', {
                element: this.id,
                updates: {
                    changed: true,
                    threshold: value,
                },
            });
            this.handleInput();
        }, 200);
    },

    mounted() {
        const updates = {};
        if (!this.data.threshold) {
            updates.changed = true;
            updates.threshold = 0.9;
        }
        if (!this.data.merge) {
            updates.changed = true;
            updates.merges = [];
        }
        this.$store.commit('updateWorkflow', {
            element: this.id,
            updates,
        });
    },

    methods: {
        deleteNode() {
            console.log('delete');
        },

        calculateSimilarity(paper1, paper2) {
            if (paper1.doi && paper1.doi === paper2.doi) return 1;

            // let similarity = 1;
            const titleSimilarity = stringSimilarity.compareTwoStrings(
                paper1.title.toLowerCase(),
                paper2.title.toLowerCase(),
            );

            return titleSimilarity;
        },

        handleInput() {
            if (
                !this.data.input
                    || !Array.isArray(this.data.input)
                    || this.data.input.length === 0
            ) return;

            const input = this.data.input[0].concat(...this.data.input.slice(1));

            console.log('Tag', input);
            this.duplicates = [];
            this.total = input.length;

            input.forEach((paper1, index) => {
                input.slice(index).forEach((paper2) => {
                    if (paper1 === paper2) return;

                    const similarity = this.calculateSimilarity(paper1, paper2);
                    console.log(paper1.title, paper2.title, similarity);
                    if (similarity > this.data.threshold) {
                        this.duplicates.push({
                            paper1,
                            paper2,
                            similarity,
                        });
                    }
                });
            });
        },
    },

    watch: {
        'data.input': {
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
