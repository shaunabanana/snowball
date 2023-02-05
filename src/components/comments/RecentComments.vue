<template>
    <div class="recents">
        <a-comment
            v-for="record in recents" :key="record.comment.id"
            :author="record.comment.author.name"
            :content="record.comment.content"
            :datetime="datetime(record.comment.datetime)"
        >
            <template #avatar>
                <Avatar :size="48"
                    :salt="record.comment.author.salt"
                    :palette="record.comment.author.palette"
                />
            </template>
            <template #actions>
                <a-button type="text" size="mini" class="title-button"
                    @click="
                        store.activeSheet = record.sheet.id;
                        store.activePaper = record.paper.id;
                        store.selection = [record.paper.id];
                        store.screen = 'screen';
                    "
                >
                    {{record.paper.title}}
                </a-button>
            </template>
        </a-comment>
    </div>
</template>

<script>
import friendlyTime from 'friendly-time';

import useSnowballStore from '@/store';
import Avatar from '@/components/main/Avatar.vue';

export default {
    name: 'CommentList',
    components: {
        Avatar,
    },
    props: {
        comments: {
            type: Array,
            default: () => ([]),
        },
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    computed: {
        recents() {
            const recents = [];

            this.store.sheets.forEach((sheet) => {
                const output = this.store.dataflow.output[sheet.id];
                if (!output || !output.papers) return;
                output.papers.forEach((paper) => {
                    if (paper.comments.length === 0) return;
                    recents.push({
                        sheet,
                        paper,
                        comment: paper.comments[paper.comments.length - 1],
                    });
                });
            });

            recents.sort((a, b) => b.comment.datetime - a.comment.datetime);

            return recents;
        },
    },

    methods: {
        datetime(timestamp) {
            return friendlyTime(new Date(timestamp));
        },

        truncate(text) {
            return text.length > 40
                ? `${text.slice(0, 30)}...${text.slice(-10)}`
                : text;
        },
    },
};
</script>

<style>
.title-button {
    padding: 0;
    white-space: normal;
    text-align: left;
    height: auto;
}

.recents .arco-comment-actions {
    margin-top: 0;
}
</style>
