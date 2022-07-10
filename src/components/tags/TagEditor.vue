<template>
    <a-space class="tag-editor">
        <Tag closable
            v-for="tagId in textTags" :key="tagId"
            style="margin-top: 0.5rem"
            :color="$store.state.tags[tagId].color"
            :text="$store.state.tags[tagId].text"
            @close="handleClose(tagId)"
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

export default {
    name: 'TagEditor',
    components: { Tag },
    props: {
        editable: {
            type: Boolean,
            default: true,
        },
    },

    data() {
        return {
            inputVisible: false,
            inputValue: '',
        };
    },

    computed: {
        textTags() {
            const textTags = [];
            if (!this.$store.state.activePaper) return [];
            this.$store.state.activePaper.tags.forEach((key) => {
                if (this.$store.state.tags[key].type === 'text') {
                    textTags.push(this.$store.state.tags[key].id);
                }
            });
            return textTags;
        },

        autocompleteTags() {
            const textTags = [];
            Object.keys(this.$store.state.tags).forEach((key) => {
                const tag = this.$store.state.tags[key];
                if (tag.type === 'text') {
                    textTags.push(tag.text);
                }
            });
            return textTags;
        },
    },

    methods: {
        handleClose(tagText) {
            const newTags = [...this.$store.state.activePaper.tags];
            this.$store.commit('updatePaper', {
                paper: this.$store.state.activePaper.id,
                updates: {
                    tags: newTags.filter((tagId) => tagId !== tagText),
                },
            });
            // this.$emit("update:modelValue", newValue);
        },

        addTag(tagText) {
            if (tagText.length > 0) {
                if (!this.$store.state.activePaper.tags.includes(tagText)) {
                    const newTags = [...this.$store.state.activePaper.tags];
                    newTags.push(tagText);
                    if (!this.$store.state.tags[tagText]) {
                        this.$store.commit('addTag', {
                            id: tagText,
                            type: 'text',
                            color: 'blue',
                            text: tagText,
                        });
                    }
                    this.$store.commit('updatePaper', {
                        paper: this.$store.state.activePaper.id,
                        updates: {
                            tags: newTags,
                        },
                    });
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
                ? [...this.$store.state.tags].filter(this.createFilter(queryString))
                : [...this.$store.state.tags];
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
