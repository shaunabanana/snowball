<template>
    <a-space style="flex-wrap: wrap;">
        <a-popover v-for="tag in tags" :key="tag.id" >
            <Tag
                style="margin-top: 0.5rem"
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

export default {
    name: 'TagManager',
    components: {
        Tag,
        TagModal,
    },
    props: {
        tags: {
            type: Object,
        },
    },

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

    methods: {
        usageCount(tagId) {
            return `${this.$store.getters.tagUsageCount(tagId)}`;
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
                Object.keys(this.$store.state.papers).forEach((paperId) => {
                    const paper = this.$store.state.papers[paperId];
                    if (paper.tags.includes(tag.id)) {
                        const newTags = paper.tags.filter((t) => t !== tag.id);
                        this.$store.commit('updatePaper', {
                            paper: paper.id,
                            updates: {
                                tags: newTags,
                            },
                        });
                    }
                });
            }
            this.$store.commit('deleteTag', tag);
        },
    },
};
</script>
