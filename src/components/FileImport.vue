<template>
    <div class="file-import">
        <el-upload
            drag
            class="upload-demo"
            :auto-upload="false"
            :accept="'.bib'"
            :file-list="fileList"
            :show-file-list="false"
        >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
                Start by uploading a BibTeX file of your initial papers. <br/>
                <em>Drop here or click to upload</em>
            </div>
        </el-upload>
    </div>
</template>

<script>
// import { UploadFilled } from '@element-plus/icons-vue'
import { processFile } from "@/utils/import";

export default {
    name: "FileImport",
    // components: {
    //     UploadFilled
    // },

    data() {
        return {
            fileList: [],
        };
    },

    watch: {
        fileList: {
            deep: true,
            handler() {
                if (this.fileList.length === 0) return;
                const file = this.fileList.pop();

                this.$store.commit('setLoading', true);
                processFile(file.raw).then((processed) => {
                    this.$emit("import", processed);
                });
            },
        },
    },
};
</script>

<style scoped>
</style>
