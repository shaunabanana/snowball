<template>
    <a-space wrap>
        <Avatar :seed="userSeed" :tooltip="`${userTooltip} (Me)`"/>
    </a-space>
</template>

<script>
import Avatar from '@/components/main/Avatar.vue';

export default {
    name: 'ProjectCollaborators',
    components: { Avatar },

    computed: {
        userSeed() {
            const { user } = this.$store.state;
            if (user.name && user.email && user.salt) {
                return user.name + user.email + user.salt;
            }
            return '';
        },

        userTooltip() {
            const { user } = this.$store.state;
            if (user.name && user.email && user.salt) {
                return user.name;
            }
            return '';
        },
    },
};
</script>
