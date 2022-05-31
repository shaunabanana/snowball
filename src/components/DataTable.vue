<template>
    <div class="data-table">
        <el-row>
            <el-col :span="12">
                <!-- <el-button>« Snowball Backward</el-button> -->
                <el-button>Snowball from included papers »</el-button>
            </el-col>
            <el-col :span="12">
                <el-input
                    v-model="filter"
                    placeholder="Filter papers..."
                    clearable
                >
                    <template #append>
                        <el-button @click="filterPapers">Filter</el-button>
                    </template>
                </el-input>
            </el-col>
        </el-row>
        <el-row style="height: 88vh">
            <el-col :span="currentPaper ? 16 : 24">
                <el-auto-resizer>
                    <template #default="{ height, width }">
                        <el-table-v2
                            :columns="columns"
                            :data="filteredData"
                            :width="width"
                            :height="height"
                            :row-event-handlers="{ onClick: onRowClick }"
                            :sort-by="{ key: 'include', order: 'asc' }"
                            :estimated-row-height="40"
                        />
                    </template>
                </el-auto-resizer>
            </el-col>
            <el-col v-if="currentPaper" :span="8">
                    <!-- <el-button size="small" type="info" text style="margin: 1rem; margin-bottom: 0;">✖️ Close</el-button> -->
                    <el-page-header title=" " icon="Close" style="padding: 1rem; vertical-align: center" @click="currentPaper = null"/>
                    <!-- <b> {{currentPaper ? currentPaper.title : ''}} </b> -->
                <el-descriptions
                    :title="currentPaper.title"
                    :column="1"
                    direction="vertical"
                    style="padding: 1rem"
                >
                    <el-descriptions-item>
                        <tag-editor v-model="currentPaper.tags" />
                    </el-descriptions-item>
                    
                    <el-descriptions-item label="Authors">
                        {{
                            currentPaper.authors
                                .map(
                                    (author) =>
                                        `${author.given} ${author.family}`
                                )
                                .join(", ")
                        }}
                    </el-descriptions-item>

                    <el-descriptions-item label="Abstract">
                        {{ currentPaper.abstract }}
                    </el-descriptions-item>

                    <el-descriptions-item label="Year">
                        {{ currentPaper.year }}
                    </el-descriptions-item>
                </el-descriptions>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="jsx">
import { formatAuthors } from '@/utils/import'
import { filter } from '@/utils/search';

import TagEditor from '@/components/TagEditor.vue'

export default {
    name: "DataTable",
    components: {
        TagEditor
    },
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
            filteredData: this.data,
            currentPaper: null,
            columns: [
                {
                    key: "include",
                    dataKey: "include",
                    title: "Include",
                    width: 80,
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
                    width: 350},
                {
                    key: "authors",
                    dataKey: "authors",
                    title: "Authors",
                    width: 150,
                    cellRenderer: ({ cellData: authors }) => formatAuthors(authors),
                },
                {
                    key: "year",
                    dataKey: "year",
                    title: "Year",
                    width: 100,
                    cellRenderer: ({ cellData: year }) => year,
                },
                // {
                //     key: "abstract",
                //     dataKey: "abstract",
                //     title: "Abstract",
                //     width: 500
                // },
                // {
                //     key: "keywords",
                //     dataKey: "keywords",
                //     title: "Keywords",
                //     width: 200,
                //     cellRenderer: ({ cellData: keywords }) =>
                //         keywords.map((keyword) => (
                //             <>{keyword}, <br/></>
                //         )),
                // },
                { 
                    key: "tags", 
                    dataKey: "tags", 
                    title: "Tags",
                    width: 200,
                    cellRenderer: ({ cellData: tags }) =>
                        tags.map(tag => (
                            <el-tag style="margin-right: 0.2rem;">{tag}</el-tag>
                        )),
                },
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

    methods: {
        filterPapers() {
            if (this.filter.length === 0) {
                this.filteredData = this.data;
                return;
            }
            this.filteredData = filter(this.data, this.filter);
        },

        onRowClick(event) {
            this.currentPaper = event.rowData;
        }
    }
};
</script>

<style>
.va-data-table td {
    white-space: normal !important;
}
</style>
