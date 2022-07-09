<template>
    <a-upload draggable
        v-model:file-list="fileList"
        :limit="1"
        :auto-upload="false"
        :show-file-list="false"
        @change="loadFile"
    />
</template>

<script>
import { nextTick } from 'vue';
import { processFile } from '@/utils/import';

export default {
    name: 'FileLoader',

    data() {
        return {
            fileList: [],
        };
    },

    methods: {
        loadFile(files) {
            if (files.length === 0) return;
            this.$store.commit('setLoading', true);
            nextTick(() => {
                processFile(files[0].file)
                    .then((processed) => {
                        this.$emit('import', processed);
                    })
                    .catch((error) => {
                        console.log('Error reading file.', error);
                        this.$message.error(error.message);
                        this.fileList = [];
                        this.$store.commit('setLoading', false);
                    });
            });
        },
    },
};
</script>
