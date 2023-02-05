<template>
    <a-space style="flex-wrap: wrap;">
        <a-popover v-for="tag in sortedTags" :key="tag.id" >
            <Tag
                style="margin-top: 0.5rem"
                :id="tag.id"
                :color="tag.color"
                :text="tag.text"
                :additional="usageCount(tag.id)"
                @close="handleClose(tag)"
            />
            <!-- <template #title>
                {{ tag }}
            </template> -->
            <template #content>
                <a-button-group>
                    <a-button size="mini" type="text" @click="editTag(tag)">
                        <template #icon>
                            <icon-edit />
                        </template>
                        Edit
                    </a-button>
                    <a-popconfirm @ok="deleteTag(tag)"
                        content="Are you sure you want to delete this tag?"
                    >
                        <a-button size="mini" type="text" status="danger">
                            <template #icon>
                                <icon-delete />
                            </template>
                            Delete
                        </a-button>
                    </a-popconfirm>
                </a-button-group>
            </template>
        </a-popover>
    </a-space>
    <TagModal
        :visible="showModal"
        :id="id"
        :type="type"
        :color="color"
        :text="text"
        :method="method"
        :filter="filter"
        @close="showModal=false"
    />
</template>

<script>
import Tag from '@/components/tags/Tag.vue';
import TagModal from '@/components/tags/TagModal.vue';
import useSnowballStore from '@/store';

export default {
    name: 'TagManager',
    components: {
        Tag,
        TagModal,
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    data() {
        return {
            showModal: false,
            id: '',
            type: '',
            color: '',
            text: '',
            method: '',
            filter: '',
        };
    },

    computed: {
        sortedTags() {
            const defaultTags = [
                {
                    id: 'Included',
                    type: 'builtin',
                    color: 'green',
                    text: 'Included',
                },
                {
                    id: 'Excluded',
                    type: 'builtin',
                    color: 'gray',
                    text: 'Excluded',
                },
                {
                    id: 'Undecided',
                    type: 'builtin',
                    color: 'gray',
                    text: 'Undecided',
                },
                {
                    id: 'No DOI',
                    type: 'builtin',
                    color: 'red',
                    text: 'No DOI',
                },
                {
                    id: 'No Abstract',
                    type: 'builtin',
                    color: 'orange',
                    text: 'No Abstract',
                },
            ];
            const tags = [
                ...this.store.tags,
            ];
            tags.sort((a, b) => a.text.localeCompare(b.text));
            return defaultTags.concat(tags)
                .filter((tag) => this.store.tagUsageCount[tag.id]);
        },
    },

    methods: {
        usageCount(tagId) {
            const count = this.store.tagUsageCount[tagId];
            return `${count !== undefined ? count : 0}`;
        },

        editTag(tag) {
            this.id = tag.id;
            this.type = tag.type;
            this.color = tag.color;
            this.text = tag.text;
            this.method = tag.method;
            this.filter = tag.filter;
            this.showModal = true;
        },

        deleteTag(tag) {
            if (tag.type === 'text') {
                this.store.papers.forEach((paper) => {
                    if (paper.tags.includes(tag.id)) {
                        // eslint-disable-next-line no-param-reassign
                        paper.tags = paper.tags.filter((t) => t !== tag.id);
                    }
                });
            }
            this.store.tags = this.store.tags.filter((t) => t.id !== tag.id);
            this.store.updateTags();
        },
    },
};
</script>
