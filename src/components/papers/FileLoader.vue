<template>
    <a-upload draggable
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

    methods: {
        loadFile(files) {
            if (files.length === 0) return;
            this.$store.commit('setLoading', true);
            nextTick(() => {
                processFile(files[0].file).then((processed) => {
                    this.$emit('import', processed);
                });
            });
        },
    },
};
</script>
