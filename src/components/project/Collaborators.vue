<template>
    <a-space wrap>
        <!-- <Avatar v-for="person in collaborators" :key="person.name"
            :seed="getSeed(person)"
            :tooltip="getTooltip(person)"
        /> -->
        Coming soon!
    </a-space>
</template>

<script>
// import Avatar from '@/components/main/Avatar.vue';
// import { gatherRepository } from '@/utils/git';

export default {
    name: 'ProjectCollaborators',
    components: {
        // Avatar
    },

    data() {
        return {
            collaborators: [],
        };
    },

    methods: {
        getSeed(person) {
            const { user } = this.$store.state;
            if (user.name && user.email && user.salt) {
                if (user.name === person.name) {
                    return user.name + user.email + user.salt;
                }
            }
            return person.name + person.email;
        },

        getTooltip(person) {
            const { user } = this.$store.state;
            if (user.name && user.email && user.salt) {
                if (user.name === person.name) {
                    return `${user.name} (Me)`;
                }
            }
            return person.name;
        },
    },

    mounted() {
        // gatherRepository(this.$store.state).then((repo) => {
        //     this.collaborators = repo.authors;
        //     console.log(this.collaborators);
        // });
    },
};
</script>
