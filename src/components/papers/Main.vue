<template>
    <a-layout style="overflow: hidden">
        <a-layout-header style="padding-left: 20px">
            <Tabs />
        </a-layout-header>
        <a-layout style="padding: 0 0 0 24px">
            <a-layout-content id="paper-detail-container">
                <Toolbar style="margin-bottom: 0.5rem" />
                <a-split
                    :default-size="0.75"
                    :style="{
                        height: 'calc(100% - 1rem)',
                        width: '100%',
                    }"
                    v-model:size="size"
                    min="80px"
                >
                    <template #first>
                        <Table />
                    </template>
                    <template #second>
                        <PaperDetails />
                    </template>
                </a-split>
            </a-layout-content>
            <!-- <a-layout-footer>Footer</a-layout-footer> -->
        </a-layout>
    </a-layout>
</template>

<script>
import Tabs from '@/components/papers/Tabs.vue';
import Table from '@/components/papers/Table.vue';
import Toolbar from '@/components/papers/Toolbar.vue';
import PaperDetails from '@/components/papers/PaperDetails.vue';

export default {
    name: 'PapersScreen',
    components: {
        Tabs,
        Table,
        Toolbar,
        PaperDetails,
    },

    // props: {
    //     data: Array,
    // },

    data() {
        return {
            size: 0.75,
        };
    },

    methods: {},
};
</script>
