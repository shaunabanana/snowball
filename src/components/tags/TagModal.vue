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
        <a-form>
            <a-form-item v-if="!id && type === 'auto'">
                This tag will be automatically added to papers if they match the search query.
            </a-form-item>

            <a-form-item label="Name">
                <a-input v-model="tagText" placeholder="Enter a name for the tag" allow-clear />
            </a-form-item>

            <a-form-item label="Query" v-if="type === 'auto'">
                <a-input
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
            </a-form-item>

            <a-form-item label="Color">
                <a-space wrap style="max-width: 20rem">
                    <a-tag v-for="(colorName, index) of colors" :key="index"
                        style="cursor: pointer"
                        :color="colorName"
                        :bordered="tagColor === colorName"
                        @click="tagColor = colorName"
                    >
                        <icon-check v-if="tagColor === colorName"/>
                        {{ colorName }}
                    </a-tag>
                </a-space>
            </a-form-item>
        </a-form>
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
        color: {
            type: String,
            default: 'blue',
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
            tagColor: 'color',
            colors: [
                'red',
                'orangered',
                'orange',
                'gold',
                'lime',
                'green',
                'cyan',
                'blue',
                'purple',
                'pinkpurple',
                'magenta',
                'gray',
            ],
        };
    },

    watch: {
        visible() {
            this.tagFilter = this.filter;
            this.tagText = this.text;
            this.tagColor = this.color;
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
                        color: this.tagColor,
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
