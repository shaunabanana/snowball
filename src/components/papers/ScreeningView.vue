<template>
    <a-split
        :default-size="0.7"
        :style="{
            height: `${height}px`,
            width: '100%',
        }"
        v-model:size="detailsSplitRatio"
    >
        <template #first>
            <div>
                <a-split
                    direction="vertical"
                    :default-size="0.8"
                    v-model:size="tableSplitRatio"
                    :style="{ height: `${height}px` }"
                >
                    <template #first>
                        <Table/>
                    </template>
                    <template #second>
                        <div style="padding: 0.5rem">
                            <TagManager />
                        </div>
                    </template>
                </a-split>
            </div>
        </template>
        <template #second>
            <PaperDetails />
        </template>
    </a-split>
</template>

<script>
import Table from '@/components/papers/Table.vue';
import PaperDetails from '@/components/papers/PaperDetails.vue';
import TagManager from '@/components/tags/TagManager.vue';

import useSnowballStore from '@/store';

export default {
    name: 'ScreeningView',
    components: {
        Table,
        PaperDetails,
        TagManager,
    },
    props: {
        height: Number,
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    data() {
        return {
            detailsSplitRatio: 1,
            tableSplitRatio: 0.8,
        };
    },

    watch: {
        'store.activePaper': {
            deep: true,
            handler() {
                if (this.store.activePaper) {
                    if (this.detailsSplitRatio === 1) this.detailsSplitRatio = 0.7;
                } else {
                    this.detailsSplitRatio = 1;
                }
            },
        },
    },
};
</script>

<style scoped>
.table-container {
    overflow: hidden;
}

.arco-split-trigger-icon-wrapper {
    background-color: white !important;
}
</style>
