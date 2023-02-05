<template>
    <a-space class="tag-editor">
        <Tag closable
            v-for="tag in textTags" :key="tag"
            style="margin-top: 0.5rem"
            :id="tag.id"
            :color="tag.color"
            :text="tag.text"
            @close="handleClose(tag.id)"
        />
        <a-auto-complete
            v-if="editable"
            ref="input"
            size="mini"
            style="margin-top: 0.5rem"
            placeholder="New tag..."
            v-model:model-value="inputValue"
            :data="autocompleteTags"
            :trigger-props="{
                autoFitPopupWidth: false,
                autoFitPopupMinWidth: true,
            }"
            @select="addTag($event)"
            @keyup.enter="addTag(inputValue)"
        />
    </a-space>
</template>

<script>
import { nextTick } from 'vue';
import Tag from '@/components/tags/Tag.vue';
import useSnowballStore from '@/store';

export default {
    name: 'TagEditor',
    components: { Tag },
    props: {
        editable: {
            type: Boolean,
            default: true,
        },
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    data() {
        return {
            inputVisible: false,
            inputValue: '',
        };
    },

    computed: {
        textTags() {
            if (!this.store.currentPaper) return [];
            return this.store.tags.filter((tag) => (
                this.store.currentPaper.tags.includes(tag.id)
                && tag.type === 'text'
            ));
        },

        autocompleteTags() {
            const textTags = [];
            this.store.tags.forEach((tag) => {
                if (tag.type === 'text') {
                    textTags.push(tag.text);
                }
            });
            return textTags;
        },
    },

    methods: {
        handleClose(tagText) {
            const newTags = [...this.store.currentPaper.tags];
            this.store.edit(
                this.store.activeSheet,
                this.store.activePaper,
                { tags: newTags.filter((tagId) => tagId !== tagText) },
            );
        },

        addTag(tagText) {
            console.log('adding tag to active paper:', tagText);
            if (tagText.length > 0) {
                if (!this.store.currentPaper.tags.includes(tagText)) {
                    console.log('active paper tags:', this.store.currentPaper.tags);
                    const newTags = [...this.store.currentPaper.tags];
                    newTags.push(tagText);
                    if (!this.store.tag(tagText)) {
                        this.store.tags.push({
                            id: tagText,
                            type: 'text',
                            color: 'blue',
                            text: tagText,
                        });
                    }
                    this.store.edit(
                        this.store.activeSheet,
                        this.store.activePaper,
                        { tags: newTags },
                    );
                    this.store.updateTags();
                }
            }
            nextTick(() => {
                this.inputValue = '';
            });
        },

        handleSelect(item) {
            this.addTag(item);
        },

        querySearch(queryString, callback) {
            const results = queryString
                ? [...this.store.tags].filter(this.createFilter(queryString))
                : [...this.store.tags];
            // call callback function to return suggestions
            callback(results);
        },

        createFilter(queryString) {
            return (tag) => (
                tag.toLowerCase().indexOf(queryString.toLowerCase()) === 0
            );
        },
    },
};
</script>

<style scoped>
.tag-editor {
    flex-wrap: wrap;
    margin-left: 0;
    margin-top: -0.5rem;
    margin-bottom: 0.5rem;
}
</style>
