<template>
    <a-table
        size="large"
        :bordered="false"
        :columns="columns"
        :data="data"
        :row-selection="rowSelection"
        :virtual-list-props="{ height: height }"
        :pagination="false"
        :scroll="{ x: 1000 }"
    />
</template>

<script>
export default {
    name: 'PaperTable',
    components: {},

    props: {
        // data: Array,
        height: {
            type: Number,
            default: 500,
        },
    },

    data() {
        return {
            data: Array(1000)
                .fill(null)
                .map((_, index) => ({
                    key: String(index),
                    name: `User ${index + 1}`,
                    address: '32 Park Road, London',
                    email: `user.${index + 1}@example.com`,
                })),
            columns: [
                {
                    title: 'Name',
                    dataIndex: 'name',
                    sortable: {
                        sortDirections: ['ascend', 'descend'],
                    },
                    width: 140,
                },
                {
                    title: 'Address',
                    dataIndex: 'address',
                    sortable: {
                        sortDirections: ['ascend', 'descend'],
                    },
                },
                {
                    title: 'Email',
                    dataIndex: 'email',
                    sortable: {
                        sortDirections: ['ascend', 'descend'],
                    },
                },
            ],
            rowSelection: {
                type: 'checkbox',
                showCheckedAll: true,
            },
        };
    },

    methods: {},
};
</script>
