<template>
    <a-layout style="overflow: hidden" ref="mainContainer" id="main-container">
        <a-layout-header style="padding-left: 20px">
            <Tabs />
        </a-layout-header>
        <a-layout style="padding: 0 0 0 24px">
            <a-layout-content>
                <a-space direction="vertical">
                    <Toolbar />
                    <a-split
                        :default-size="0.7"
                        :style="{
                            height: `${height}px`,
                            width: '100%',
                        }"
                        v-model:size="detailsSize"
                    >
                        <template #first>
                            <div>
                                <a-split
                                    direction="vertical"
                                    :default-size="0.8"
                                    v-model:size="tableSize"
                                    :style="{ height: `${height}px` }"
                                >
                                    <template #first>
                                        <Table :height="tableHeight" />
                                    </template>
                                    <template #second>
                                        <div style="padding: 0.5rem">
                                            <a-space wrap>
                                                <a-tag closable checkable> Tag </a-tag>
                                                <a-tag closable checkable> Tag </a-tag>
                                            </a-space>
                                        </div>
                                    </template>
                                </a-split>
                            </div>
                        </template>
                        <template #second>
                            <PaperDetails />
                        </template>
                    </a-split>
                </a-space>
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
            detailsSize: 0.7,
            tableSize: 0.8,
            height: 600,
            tableHeight: 100,
        };
    },

    mounted() {
        this.height = this.$refs.mainContainer.$el.offsetHeight - 20;
        this.tableHeight = this.height * this.tableSize + 29;
        const resizeObserver = new ResizeObserver((events) => {
            events.forEach((event) => {
                if (event.target.id !== 'main-container') return;
                this.height = event.contentRect.height - 90;
            });
        });
        resizeObserver.observe(this.$refs.mainContainer.$el);
    },

    methods: {
        resizeTable() {
            // console.log(event);
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
