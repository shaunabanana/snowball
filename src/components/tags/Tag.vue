<template>
    <a-tag
        style="cursor: pointer"
        :color="color"
        :closable="closable"
        :bordered="this.store.filterTags.length > 0 && highlighted"
        :style="{ opacity: highlighted ? 1.0 : 0.5 }"
        @click="searchForTag(text)"
        @close="$emit('close')"
    >
        <!-- <icon-check v-if="this.store.filterTags.length > 0 && highlighted"/> -->
        {{ text }}
        <span v-if="additional">({{additional}})</span>
    </a-tag>
</template>

<script>
import useSnowballStore from '@/store';

export default {
    name: 'SnowballTag',
    props: {
        id: String,
        text: String,
        color: String,
        closable: Boolean,
        additional: String,
        // toggle: {
        //     type: Boolean,
        //     default: false,
        // },
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    methods: {
        searchForTag() {
            if (this.store.filterTags.includes(this.id)) {
                this.store.filterTags = this.store.filterTags.filter(
                    (tagId) => tagId !== this.id,
                );
            } else {
                this.store.filterTags.push(this.id);
            }
            // } else {
            //     this.store.filterTags = [this.id];
            // }
            this.store.filterChanged = true;
        },
    },

    computed: {
        highlighted() {
            // if (!this.toggle) return true;
            if (this.store.filterTags.length === 0) return true;
            return this.store.filterTags.includes(this.id);
        },
    },
};
</script>
