<template>
    <div class="data-table">
        <el-row>
            <el-col :span="12">
                <!-- <el-button>« Snowball Backward</el-button> -->
                <el-button @click="$emit('snowball')"
                    >Snowball from included papers »</el-button
                >
            </el-col>
            <el-col :span="12">
                <el-input
                    v-model="filter"
                    placeholder="Filter papers..."
                    clearable
                    spellcheck="false"
                    style="padding-right: 1rem"
                    @clear="filterPapers(false)"
                    @keyup.enter="filterPapers(false)"
                >
                    <template #suffix>
                        {{ this.filter.length > 0 && filteredData.length !== data.length ? `${filteredData.length} filtered` : '' }}
                    </template>
                    <template #append>
                        <el-button @click="filterPapers(false)"
                            >Filter</el-button
                        >
                    </template>
                </el-input>
            </el-col>
        </el-row>
        <el-row style="height: 88vh">
            <el-col :span="currentPaper ? 16 : 24" style="height: 88vh">
                <el-auto-resizer @resize="onResize">
                    <template #default="{ height, width }">
                        <el-table-v2
                            :columns="columns"
                            :data="filteredData"
                            :width="width"
                            :height="height"
                            :row-class="rowClass"
                            :row-event-handlers="{ onClick: onRowClick }"
                            :sort-by="{ key: 'include', order: 'asc' }"
                            :estimated-row-height="40"
                        />
                    </template>
                </el-auto-resizer>
            </el-col>
            <el-col v-if="currentPaper" :span="8">
                <el-row>
                    <el-page-header
                        title=" "
                        icon="Close"
                        style="padding: 1rem; vertical-align: center"
                        @click="currentPaper = null"
                    />
                </el-row>
                <el-row
                    style="overflow-y: auto"
                    :style="{ height: `${tableHeight}px` }"
                >
                    <el-descriptions
                        :title="currentPaper.title"
                        :column="1"
                        direction="vertical"
                        style="padding: 1rem; padding-bottom: 20rem"
                    >
                        <el-descriptions-item>
                            <tag-editor
                                :tags="currentPaper.tags"
                                :paper-id="currentPaper.id"
                            />
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
                            <span v-if="!editing" 
                                @click="editing = true; $nextTick(() => $refs.abstract.focus())">
                                {{ currentPaper.abstract ? currentPaper.abstract : 'Abstract missing.' }}
                            </span>
                            <el-input v-else ref="abstract"
                                type="textarea"
                                v-model="currentPaper.abstract"
                                :autosize="{ minRows: 4 }"
                                placeholder="Abstract missing."
                                @change="
                                    $store.commit('updatePaper', {
                                        paper: currentPaper.id,
                                        updates: { abstract: $event },
                                    })
                                "
                                @blur="editing = false"
                            />
                        </el-descriptions-item>

                        <el-descriptions-item label="Year">
                            {{ currentPaper.year }}
                        </el-descriptions-item>

                        <el-descriptions-item label="Notes">
                            <el-input
                                type="textarea"
                                v-model="currentPaper.notes"
                                :autosize="{ minRows: 4 }"
                                placeholder="Type out any notes here."
                                @change="
                                    $store.commit('updatePaper', {
                                        paper: currentPaper.id,
                                        updates: { notes: $event },
                                    })
                                "
                            />
                        </el-descriptions-item>
                    </el-descriptions>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="jsx">
import { formatAuthors } from '@/utils/import'
import { filter } from '@/utils/search';
import { processTags } from '@/utils/tags';

import TagEditor from '@/components/TagEditor.vue'

export default {
    name: "DataTable",
    components: {
        TagEditor
    },
    props: {
        data: {
            type: Array,
            required: true
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
            tableWidth: 0,
            tableHeight: 0,
            defaultWidths: [],
            editing: false,
            columns: [
                {
                    key: "include",
                    dataKey: "include",
                    title: "Include",
                    width: 80,
                    hidden: false,
                    cellRenderer: ({rowData}) => (
                        <el-switch
                            value={rowData.include}
                            onChange={value => {
                                this.$store.commit('updatePaper', {
                                    paper: rowData.id,
                                    updates: {include: value}
                                });
                            }}
                            size="large"
                            class="mt-2"
                            inline-prompt
                            active-text="Y"
                            inactive-text="N"
                        />
                    )
                },
                { 
                    key: "title", 
                    dataKey: "title", 
                    title: "Title",
                    width: 350,
                    hidden: false,
                },
                {
                    key: "authors",
                    dataKey: "authors",
                    title: "Authors",
                    width: 150,
                    hidden: false,
                    cellRenderer: ({ cellData: authors }) => formatAuthors(authors),
                },
                {
                    key: "year",
                    dataKey: "year",
                    title: "Year",
                    width: 100,
                    hidden: false,
                    cellRenderer: ({ cellData: year }) => year,
                },
                { 
                    key: "tags", 
                    dataKey: "tags", 
                    title: "Tags",
                    width: 200,
                    hidden: false,
                    cellRenderer: ({rowData}) => {
                        return processTags(rowData).map(tag => (
                            <el-tag style="margin-right: 0.2rem; cursor: pointer;"
                                type={tag.type}
                                onClick={() => {
                                    this.filter = `"${tag.text}"`;
                                    this.filterPapers(true);
                                }}
                            >{tag.text}</el-tag>
                        ))
                    }
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

    mounted () {
        this.defaultWidths = this.columns.map(column => column.width);
    },

    methods: {
        filterPapers(tag) {
            if (this.filter.length === 0) {
                this.filteredData = this.data;
                return;
            }
            this.filteredData = filter(
                this.data, 
                this.filter, 
                tag ? ['tags'] : ['title', 'abstract', 'keywords', 'tags'],
                { tags: (tags, paper) => processTags(paper).map(tag => tag.text).join(' ') }
            );
        },

        onRowClick(event) {
            this.currentPaper = event.rowData;
            this.editing = false;
        },

        rowClass(row) {
            let classes = [];
            if (this.currentPaper && row.rowData.id === this.currentPaper.id) {
                classes.push('selected');
            }
            // if (!row.rowData.doi) {
            //     classes.push('no-doi');
            // }
            return classes.join(' ');
        },

        onResize (event) {
            this.tableWidth = event.width;
            this.tableHeight = event.height;

            let availableWidth = event.width;
            for (let columnId = 0; columnId < this.columns.length; columnId++) {
                const column = this.columns[columnId];
                if (availableWidth <= 0) {
                    // console.log('Hidden column', column.title);
                    column.hidden = true;
                    column.width = 0;
                } else if (availableWidth - this.defaultWidths[columnId] <= 0) {
                    // console.log('Second to last available column', column.title);
                    column.hidden = false;
                    column.width = availableWidth;
                    availableWidth -= this.defaultWidths[columnId];
                } else if (columnId === this.columns.length - 1) {
                    // console.log('Last column width available', column.title, columnId);
                    column.hidden = false;
                    column.width = availableWidth;
                } else {
                    // console.log('Ordinary column', column.title, columnId);
                    availableWidth -= this.defaultWidths[columnId];
                    column.width = this.defaultWidths[columnId];
                }
            }
        }
    },

    watch: {
        data () {
            this.filterPapers(false);
        }
    }
};
</script>

<style>
.va-data-table td {
    white-space: normal !important;
}

.selected {
    background: var(--el-color-primary-light-8);
}

.no-doi {
    background: var(--el-color-danger-light-8);
}

.data-table {
    height: 100%;
}
</style>
