<template>
    <el-tag
        v-for="tag in tags" :key="tag"
        style="margin-right: 0.2rem"
        :closable="tag.type === ''"
        :type="tag.type"
        @close="handleClose(tag)"
    >
        {{ tag.text }}
    </el-tag>
    <el-autocomplete
        ref="input"
        class="inline-input w-50"
        size="small"
        placeholder="New tag..."
        v-if="inputVisible"
        v-model="inputValue"
        :fetch-suggestions="querySearch"
        @keyup.enter="addTag(inputValue)"
        @select="handleSelect"
    >
        <template #default="{ item }">
            {{item}}
        </template>
    </el-autocomplete>
    <el-button
        v-else
        class="button-new-tag ml-1"
        size="small"
        @click="showInput"
    >
        + Tag
    </el-button>
</template>

<script>
import { nextTick } from "vue";

export default {
    name: "TagEditor",

    props: {
        tags: {
            type: Array,
        },
        paperId: {
            type: String
        },
    },

    data() {
        return {
            inputVisible: false,
            inputValue: "",
        };
    },

    methods: {
        showInput() {
            this.inputVisible = true;
            nextTick(() => {
                this.$refs.input.focus();
            });
        },

        handleClose(tag) {
            const newTags = [...this.tags];
            newTags.splice(newTags.indexOf(tag), 1);
            this.$store.commit("updatePaper", {
                paper: this.paperId,
                updates: {
                    tags: newTags
                }
            });
            // this.$emit("update:modelValue", newValue);
        },

        addTag(tag) {
            if (tag.length > 0) {
                const newTags = [...this.tags];
                newTags.push({ type: '', text: tag });
                this.$store.commit("addTag", tag);
                this.$store.commit('updatePaper', {
                    paper: this.paperId,
                    updates: {
                        tags: newTags
                    }
                })
                // this.$emit("update:modelValue", newValue);
            }
            this.inputVisible = false;
            this.inputValue = "";
        },

        handleSelect(item) {
            this.addTag(item);
        },

        querySearch(queryString, callback) {
            const results = queryString
                ? [...this.$store.state.tags].filter(this.createFilter(queryString))
                : [...this.$store.state.tags];
            console.log(results, this.$store.state.tags);
            // call callback function to return suggestions
            callback(results);
        },

        createFilter(queryString) {
            return tag => {
                return (
                    tag.toLowerCase().indexOf(queryString.toLowerCase()) === 0
                );
            };
        },
    },
};
</script>