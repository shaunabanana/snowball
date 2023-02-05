<template>
    <a-modal
        :fullscreen="true"
        :closable="false"
        :visible="visible"
        @ok="commitMerges"
        @cancel="this.$emit('close');"
    >
        <template #title>
            Resolve duplicates
        </template>
        <div>
            <span>For each potential duplicate</span>
            <a-space direction="vertical">
                <a-table
                    v-for="(group, index) in duplicates" :key="index"
                    column-resizable
                    row-key="rowKey"
                    :pagination="false"
                    :data="group.papers"
                    :span-method="spanMethod"
                    :scroll="{ x: '100%', y: '100%' }"
                >
                    <template #columns>
                        <a-table-column
                            title="Merge"
                            data-index="merge"
                            :width="80"
                        >
                            <template #cell="{ }">
                                <a-switch type="round" size="small"
                                    :model-value="edits[index] ? edits[index].merge : group.merged"
                                    @change="mergeRecords(index, $event)"
                                />
                            </template>
                        </a-table-column>

                        <a-table-column
                            title="Title"
                            data-index="title"
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
                        ></a-table-column>

                        <a-table-column
                            title="Abstract"
                            data-index="abstract"
                            body-cell-class="abstract"
                        >
                            <template #cell="{ record }">
                                <a-typography-paragraph
                                    spacing="close"
                                    class="body-text"
                                >
                                    {{ record.abstract }}
                                </a-typography-paragraph>
                            </template>
                        </a-table-column>
                    </template>
                </a-table>
            </a-space>
        </div>
    </a-modal>
</template>

<script>
import { formatAuthors } from '@/utils/import';

export default {
    props: {
        visible: {
            type: Boolean,
            default: true,
        },
        duplicates: {
            type: Array,
            default: () => [],
        },
        merges: {
            type: Object,
            default: () => {},
        },
    },

    data() {
        return {
            formatAuthors,
            edits: [],
        };
    },

    methods: {
        spanMethod({ rowIndex, column }) {
            if (rowIndex === 0 && column.dataIndex === 'merge') {
                return { rowspan: 10000 };
            }
            return null;
        },

        mergeRecords(groupIndex, value) {
            this.edits[groupIndex] = {
                merge: value,
                group: this.duplicates[groupIndex],
            };
        },

        commitMerges() {
            this.$emit('merge', this.edits);
            this.$emit('close');
        },
    },

    watch: {
        visible() {
            if (this.visible) {
                console.log('DuplicateList shown', this.duplicates);
                this.edits = [];
            }
        },
    },
};
</script>

<style>
.abstract {
    color: red;
    display: inline-block;
    height: 5rem;
    overflow-y: scroll;
    font-size: 0.6rem;
}
</style>
