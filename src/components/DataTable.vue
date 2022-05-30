<template>
    <div class="data-table" style="height: 92vh">
        <el-auto-resizer>
            <template #default="{ height, width }">
                <el-table-v2
                    :columns="columns"
                    :data="data"
                    :width="width"
                    :height="height"
                    :estimated-row-height="120"
                />
            </template>
        </el-auto-resizer>
    </div>
</template>

<script lang="jsx">
export default {
    name: "DataTable",

    props: {
        data: {
            type: Array,
            required: true,
        },
        perPage: Number,
    },

    setup() {
        console.log("setup");
    },

    data() {
        return {
            filter: "",
            // currentPage: 1,
            filteredCount: this.data.length,
            columns: [
                {
                    key: "include",
                    dataKey: "include",
                    title: "Include",
                    width: 72,
                    cellRenderer: ({rowData}) => (
                        <el-switch
                            value={rowData.include}
                            onChange={value => rowData.include = value}
                            size="large"
                            class="mt-2"
                            inline-prompt
                            active-text="Y"
                            inactive-text="N"
                        />
                    )
                },
                { key: "title", dataKey: "title", title: "Title",
                    width: 250 },
                {
                    key: "authors",
                    dataKey: "authors",
                    title: "Authors",
                    width: 200,
                    cellRenderer: ({ cellData: authors }) =>
                        authors.map((author) => (
                            <>{author}, <br/></>
                        )),
                },
                {
                    key: "abstract",
                    dataKey: "abstract",
                    title: "Abstract",
                    width: 500
                },
                {
                    key: "keywords",
                    dataKey: "keywords",
                    title: "Keywords",
                    width: 200,
                    cellRenderer: ({ cellData: keywords }) =>
                        keywords.map((keyword) => (
                            <>{keyword}, <br/></>
                        )),
                },
                { key: "tags", dataKey: "tags", title: "Tags",
                    width: 200 },
            ],
        };
    },

    computed: {
        pages() {
            return this.perPage && this.perPage !== 0
                ? Math.ceil(this.filteredCount / this.perPage)
                : this.filteredCount;
        },
    },
};
</script>

<style>
.va-data-table td {
    white-space: normal !important;
}
</style>
