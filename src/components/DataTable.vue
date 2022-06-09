<template>
    <div class="data-table">
        <el-row>
            <el-col :span="12">
                <!-- <el-button>« Snowball Backward</el-button> -->
                <!-- <el-button @click="$emit('add-paper')" icon="Plus">
                    Add paper by DOI
                </el-button> -->

                <!-- <el-button @click="$emit('add-paper')" icon="Download">
                    Export all included papers
                </el-button> -->

                <el-button @click="$emit('snowball')" plain type="primary">
                    Snowball from included papers »
                </el-button>

                <el-button @click="createNewSheet" plain v-if="filteredData.length && filteredData.length !== data.length">
                    New sheet from filtered
                </el-button>

                <!-- <el-button @click="createSmartTag" plain v-if="filteredData.length && filteredData.length !== data.length">
                    Create smart tag
                </el-button> -->
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
                    <template #prepend>
                        <el-select
                            v-model="filterMethod"
                            placeholder="Select"
                            style="width: 115px"
                        >
                            <el-option label="Boolean" value="boolean" />
                            <el-option label="RegEx" value="regex" />
                        </el-select>
                    </template>
                    <template #suffix>
                        {{
                            this.filter.length > 0 &&
                            filteredData.length !== data.length
                                ? `${filteredData.length} filtered`
                                : ""
                        }}
                    </template>
                    <template #append>
                        <el-button-group>
                            <el-button icon="Search" @click="filterPapers(false)"></el-button>
                        </el-button-group>
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
                <paper-panel ref="paperPanel"
                    :height="tableHeight"
                    :paper="currentPaper"
                    :filter="filter"
                    :filter-method="filterMethod"
                    :filter-active="filteredData.length && filteredData.length !== data.length"
                    @close-panel="currentPaper = null"/>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="jsx">
import { trace, info } from 'tauri-plugin-log-api';

import { formatAuthors } from '@/utils/import';
import { filter } from '@/utils/search';
import { processTags } from '@/utils/tags';

import PaperPanel from '@/components/PaperPanel.vue'

export default {
    name: "DataTable",
    components: {
        PaperPanel
    },
    props: {
        data: {
            type: Array,
            required: true
        }
    },

    data() {
        return {
            filter: '',
            filterMethod: 'boolean',
            // currentPage: 1,
            filteredCount: this.data.length,
            filteredData: this.data,
            currentPaper: null,
            tableWidth: 0,
            tableHeight: 0,
            defaultWidths: [],
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
                this.filterMethod,
                this.data, 
                this.filter, 
                tag ? ['tags'] : ['title', 'abstract', 'keywords', 'tags'],
                { tags: (tags, paper) => processTags(paper).map(tag => tag.text).join(' ') }
            );
            
            if (this.$refs.paperPanel) {
                this.$refs.paperPanel.highlight();
            }
        },

        onRowClick(event) {
            this.currentPaper = event.rowData.id;
            this.editing = false;
        },

        rowClass(row) {
            let classes = [];
            if (this.currentPaper && row.rowData.id === this.currentPaper) {
                classes.push('selected');
            }
            if (row.rowData.sheets.length > 1) {
                classes.push('existing');
            }
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
        },

        createNewSheet() {
            info(`Creating new sheet from ${this.filteredData.length} filtered papers.`);
            const sheetId = `layer-${Object.keys(this.$store.state.sheets).length}`;
            const sheetName = `Layer ${Object.keys(this.$store.state.sheets).length}`;
            trace(`Adding new sheet (${sheetId}) named '${sheetName}'.`);
            this.$store.commit('addSheet', {
                id: sheetId, 
                name: sheetName, 
                papers: this.filteredData.map(paper => paper.id)
            });
            // trace(`Setting active sheet to '${sheetId}'.`);
            // this.activeSheet = sheetId;
        },

        // createSmartTag() {

        // }
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

.existing {
    color: var(--el-color-info);
}

.no-doi {
    background: var(--el-color-danger-light-8);
}

.data-table {
    height: 100%;
}
</style>
