<template>
    <a-modal
        :visible="visible"
        :ok-button-props="{
            disabled:
                tagFilter && tagFilter.length === 0 ||
                tagText && tagText.length === 0
            }"
        @ok="saveTag"
        @cancel="close"
    >
        <template #title>
            {{ id ? 'Edit tag' : 'Create an automatic tag' }}
        </template>
        <a-space direction="vertical">
            <span v-if="!id && type === 'auto'">
                This tag will be automatically added based on the search query.
            </span>
            <a-input v-model="tagText" placeholder="Enter a name for the tag" allow-clear />

            <a-input v-if="type === 'auto'"
                v-model="tagFilter" placeholder="Enter a search query here..." allow-clear
            >
                <template #prepend>
                    <a-select
                        :default-value="method"
                        :trigger-props="{ autoFitPopupMinWidth: true }"
                        @change="method = $event"
                    >
                        <a-option>Boolean</a-option>
                        <a-option>RegExp</a-option>
                    </a-select>
                </template>
            </a-input>
        </a-space>
    </a-modal>
</template>

<script>
export default {
    props: {
        visible: Boolean,
        filter: String,
        text: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            default: 'text',
        },
        id: {
            type: String,
            default: undefined,
        },
    },

    data() {
        return {
            method: 'Boolean',
            tagFilter: '',
            tagText: '',
        };
    },

    watch: {
        visible() {
            this.tagFilter = this.filter;
            this.tagText = this.text;
        },
    },

    methods: {
        saveTag() {
            if (this.id) {
                this.$store.commit('updateTag', {
                    tag: this.id,
                    updates: {
                        type: this.type,
                        text: this.tagText,
                        method: this.method,
                        filter: this.tagFilter,
                    },
                });
            } else {
                this.$store.commit('addTag', {
                    id: this.tagText,
                    type: this.type,
                    color: 'purple',
                    text: this.tagText,
                    method: this.method,
                    filter: this.tagFilter,
                });
            }
            this.close();
        },

        close() {
            this.method = 'Boolean';
            this.tagType = '';
            this.tagFilter = '';
            this.tagText = '';
            this.$emit('close');
        },
    },
};
</script>
