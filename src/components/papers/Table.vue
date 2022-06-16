<template>
    <a-table
        class="paper-table"
        id="paper-table"
        size="small"
        :bordered="false"
        :data="data"
        :row-selection="rowSelection"
        :virtual-list-props="{ height: height }"
        :pagination="false"
        :scroll="{ x: '100%', y: '100%' }"
    >
        <template #columns>
            <a-table-column
                title="Decision"
                :width="145"
                :sortable="{
                    sortDirections: ['ascend', 'descend'],
                }"
            >
                <!-- <template #cell="{ record }"> -->
                <template #cell="{}">
                    <a-select
                        size="mini"
                        style="width: 112px"
                        defaultValue="Undecided"
                        placeholder="Select"
                        :trigger-props="{ autoFitPopupMinWidth: true }"
                    >
                        <a-option>Undecided</a-option>
                        <a-option>Include</a-option>
                        <a-option>Exclude</a-option>
                    </a-select>
                </template>
            </a-table-column>

            <a-table-column
                title="Title"
                data-index="name"
                :sortable="{
                    sortDirections: ['ascend', 'descend'],
                }"
            >
                <template #cell="{ record }">
                    <a-typography-paragraph
                        spacing="close"
                        style="margin-bottom: 0; font-size: 0.8rem"
                        :bold="true"
                    >
                        {{ record.name }}
                    </a-typography-paragraph>
                </template>
            </a-table-column>

            <a-table-column
                title="Authors"
                data-index="address"
                :width="120"
                :sortable="{
                    sortDirections: ['ascend', 'descend'],
                }"
            >
                <template #cell="{ record }">
                    <a-typography-paragraph
                        spacing="close"
                        style="margin-bottom: 0; font-size: 0.8rem"
                    >
                        {{ record.address }}
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
            ></a-table-column>
        </template>
    </a-table>
</template>

<script>
export default {
    name: 'PaperTable',
    components: {},

    props: {
        // data: Array,
        width: {
            type: Number,
            default: 100,
        },
        // height: {
        //     type: Number,
        //     default: 200,
        // },
    },

    data() {
        return {
            height: 200,
            data: Array(1000)
                .fill(null)
                .map((_, index) => ({
                    key: String(index),
                    name: `32 Park Road London 32 Park Road London 32 Park Road London User ${
                        index + 1
                    }`,
                    address: '32 Park Road, London',
                    email: `user.${index + 1}@example.com`,
                    year: index,
                })),
            rowSelection: {
                type: 'checkbox',
                showCheckedAll: true,
            },
        };
    },

    mounted() {
        console.log(this.$el);
        const observer = new ResizeObserver((events) => {
            events.forEach((event) => {
                if (event.target.id !== 'paper-table') return;
                this.height = event.contentRect.height;
            });
        });
        observer.observe(this.$el);
    },

    methods: {},
};
</script>

<style scoped>
/* .paper-table {
    position: absolute;
} */
</style>
