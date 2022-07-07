<template>
    <a-upload draggable
        :limit="1"
        :auto-upload="false"
        :show-file-list="false"
        @change="loadFile"
    />
</template>

<script>
import { processFile } from '@/utils/import';

export default {
    name: 'FileLoader',

    methods: {
        loadFile(files) {
            if (files.length === 0) return;
            processFile(files[0].file).then((processed) => {
                this.$emit('import', processed);
            });
        },
    },
};
</script>
