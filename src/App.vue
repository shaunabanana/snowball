<template>
    <el-tabs v-model="activeSheet" type="card">
        <el-tab-pane
            class="tab-pane"
            v-for="sheet in $store.state.sheets"
            :key="sheet.id"
            :label="sheet.name"
            :name="sheet.id"
        >
            <file-import
                v-if="sheet.papers.length === 0"
                @import="addImportedPapers"
            />
            <data-table v-if="sheet.papers.length > 0" :data="sheet.papers" />
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import FileImport from "@/components/FileImport.vue";
import DataTable from "@/components/DataTable.vue";

export default {
    name: "App",
    components: {
        FileImport,
        DataTable,
    },

    data() {
        return {
            activeSheet: "foundation",
            filter: "",
            perPage: 100,
            currentPage: 1,
        };
    },

    methods: {
        addImportedPapers(papers) {
            console.log(papers);
            this.$store.commit("addPapers", {
                sheet: this.activeSheet,
                papers: papers,
            });
        },
    },

    computed: {
    }
};
</script>

<style>
html,
body {
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
        "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

/* .app {
    // display: flex;
    width: 100%;
    height: 100%;
} */

.tab-pane {
    height: 100%;
}
</style>
