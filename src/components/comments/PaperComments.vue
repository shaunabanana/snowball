<template>
    <a-comment
        v-for="comment in comments" :key="comment.id"
        :author="comment.author.name"
        :content="comment.content"
        :datetime="datetime(comment.datetime)"
    >
        <template #avatar>
            <div style="transform: translate(0, 3px)">
                <Avatar :size="32" force-mask
                    :salt="comment.author.salt"
                    :palette="comment.author.palette"
                />
            </div>
        </template>
    </a-comment>

    <a-comment align="right">
        <template #avatar>
            <Avatar :size="32" force-mask
                :salt="store.user.salt"
                :palette="store.user.palette"
            />
        </template>
        <template #actions>
            <a-button key="1" type="primary" @click="reply"> Reply </a-button>
        </template>
        <template #content>
            <a-textarea v-model="replyText" auto-size placeholder="What are your thoughts?" />
        </template>
    </a-comment>
</template>

<script>
import { nanoid } from 'nanoid';
import friendlyTime from 'friendly-time';

import useSnowballStore from '@/store';

import Avatar from '@/components/main/Avatar.vue';

export default {
    components: {
        Avatar,
    },
    props: {
        comments: {
            type: Array,
            default: () => ([]),
        },
    },
    emits: ['update'],
    setup: () => ({
        store: useSnowballStore(),
    }),

    data: () => ({
        replyText: '',
    }),

    methods: {
        reply() {
            console.log(this.replyText);
            const comments = [...this.comments];
            comments.push({
                id: nanoid(),
                author: {
                    name: this.store.user.name,
                    salt: this.store.user.salt,
                    palette: this.store.user.palette,
                },
                content: this.replyText,
                datetime: Date.now(),
            });
            this.$emit('update', comments);
            this.replyText = '';
        },

        datetime(timestamp) {
            return friendlyTime(new Date(timestamp));
        },
    },

};
</script>
