<template>
    <a-space style="flex-wrap: wrap; margin-top: 0.5rem">
        <Tag v-for="tag in formattedTags" :key="tag.id"
            style="cursor: pointer; margin-bottom: 0.5rem"
            :id="tag.id"
            :color="tag.color"
            :text="tag.text"
        />
    </a-space>
</template>

<script>
import Tag from '@/components/tags/Tag.vue';
import { processTags } from '@/utils/tags';
import useSnowballStore from '@/store';

export default {
    name: 'TagList',
    components: { Tag },
    props: {
        paper: Object,
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    computed: {
        formattedTags() {
            return processTags(this.store, this.paper);
        },
    },
};
</script>
