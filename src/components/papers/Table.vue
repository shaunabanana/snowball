<template>
    <a-table virtualized
        class="paper-table"
        id="paper-table"
        ref="table"
        size="small"
        row-key="id"
        :bordered="false"
        :data="$store.getters.currentPapers"
        :row-selection="rowSelection"
        :selected-keys="$store.state.selection"
        :virtual-list-props="{ height: height }"
        :pagination="false"
        :scroll="{ x: 980, y: '100%' }"
        @row-click="selectRow"
        @selection-change="selectionChanged"
    >
        <template #columns>
            <a-table-column
                title="Decision"
                data-index="decision"
                :width="120"
                :sortable="{
                    sortDirections: ['ascend', 'descend'],
                }"
            >
                <template #cell="{ record }">
                    <a-radio-group
                        type="button"
                        size="mini"
                        :model-value="record.decision"
                        :class="record.decision"
                        @change="$store.commit('updatePaper', {
                            paper: record.id,
                            updates: { decision: $event }
                        })"
                    >
                        <a-radio value="exclude">
                            <icon-close />
                        </a-radio>
                        <a-radio value="undecided">
                            <icon-question />
                        </a-radio>
                        <a-radio value="include">
                            <icon-check />
                        </a-radio>
                    </a-radio-group>
                </template>
            </a-table-column>

            <a-table-column
                title="Title"
                data-index="title"
                :sortable="{
                    sortDirections: ['ascend', 'descend'],
                }"
            >
                <template #cell="{ record }">
                    <a-typography-paragraph
                        spacing="close"
                        class="body-text"
                        :bold="true"
                    >
                        {{ record.title }}
                    </a-typography-paragraph>
                </template>
            </a-table-column>

            <a-table-column
                title="Authors"
                data-index="authors"
                :width="120"
            >
                <template #cell="{ record }">
                    <a-typography-paragraph
                        spacing="close"
                        class="body-text"
                    >
                        {{ formatAuthors(record.authors) }}
                    </a-typography-paragraph>
                </template>
            </a-table-column>

            <a-table-column
                title="Year"
                data-index="year"
                :width="100"
                :sortable="{
                    sortDirections: ['ascend', 'descend'],
                }"
            ></a-table-column>

            <a-table-column
                title="Tags"
                data-index="tags"
                :sortable="{
                    sortDirections: ['ascend', 'descend'],
                }"
            >
                <template #cell="{ record }">
                    <TagList :paper="record" />
                </template>
            </a-table-column>
        </template>
    </a-table>
</template>

<script>
import TagList from '@/components/tags/TagList.vue';

import { formatAuthors } from '@/utils/import';

export default {
    name: 'PaperTable',
    components: { TagList },

    props: {
        data: {
            type: Array,
            default: () => [],
        },
        width: {
            type: Number,
            default: 400,
        },
    },

    data() {
        return {
            height: 400,
            rowSelection: {
                type: 'checkbox',
                showCheckedAll: true,
            },
            selectedKeys: [],
        };
    },

    mounted() {
        const observer = new ResizeObserver((events) => {
            events.forEach((event) => {
                if (event.target.id !== 'paper-table') return;
                this.height = event.contentRect.height;
            });
        });
        observer.observe(this.$el);
    },

    methods: {
        formatAuthors(authors) {
            return formatAuthors(authors);
        },

        selectRow(record) {
            this.$store.commit('setSelection', [record.id]);
            this.updateActivePaper();
        },

        selectionChanged(keys) {
            this.$store.commit('setSelection', keys);
        },

        updateActivePaper() {
            if (this.$store.state.selection.length === 1) {
                this.$store.commit('setActivePaper', this.$store.state.selection[0]);
            } else {
                this.$store.commit('setActivePaper', null);
            }
        },
    },

    watch: {
        height() {
            console.log(this.height);
        },
    },
};
</script>

<style>
span .arco-radio-button-content {
    padding: 0 6px !important;
}

.body-text {
    margin-bottom: 0px !important;
    font-size: 0.8rem;
    word-break: normal;
}

.include .arco-radio-button.arco-radio-checked {
    background-color: rgb(var(--green-6)) !important;
    color: var(--color-bg-5) !important;
}

.exclude .arco-radio-button.arco-radio-checked {
    background-color: rgb(var(--red-6)) !important;
    color: var(--color-bg-5) !important;
}
</style>
