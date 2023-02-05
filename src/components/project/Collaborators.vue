<template>
    <a-space wrap>
        <Avatar v-for="person in collaborators" :key="fingerprint(person)"
            :tooltip="person.name"
            :salt="person.salt"
            :palette="person.palette"
        />
    </a-space>
</template>

<script>
import useSnowballStore from '@/store';
import Avatar from '@/components/main/Avatar.vue';

export default {
    name: 'ProjectCollaborators',
    components: {
        Avatar,
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    methods: {
        fingerprint(person) {
            return person.palette
                ? person.name + person.salt + person.palette.join('')
                : person.name + person.salt;
        },
    },

    computed: {

        collaborators() {
            const collaborators = [
                this.store.user,
            ];
            const existing = new Set([
                this.fingerprint(this.store.user),
            ]);

            this.store.sheets.forEach((sheet) => {
                const output = this.store.dataflow.output[sheet.id];
                if (!output || !output.papers) return;
                output.papers.forEach((paper) => {
                    if (paper.comments.length === 0) return;
                    paper.comments.forEach((comment) => {
                        const fingerprint = this.fingerprint(comment.author);
                        if (!existing.has(fingerprint)) collaborators.push(comment.author);
                        existing.add(fingerprint);
                    });
                });
            });

            return collaborators;
        },
    },
};
</script>
