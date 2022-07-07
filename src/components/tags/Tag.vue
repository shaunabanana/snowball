<template>
    <a-tag
        style="cursor: pointer"
        :color="color"
        :closable="closable"
        @click="searchForTag(text)"
        @close="$emit('close')"
    >
        {{ text }} <span v-if="additional">({{additional}})</span>
    </a-tag>
</template>

<script>
export default {
    name: 'SnowballTag',
    props: {
        id: String,
        text: String,
        color: String,
        closable: Boolean,
        additional: String,
    },

    methods: {
        searchForTag(tag) {
            this.$store.commit('setFilter', {
                filter: `"${tag}"`,
                method: 'Boolean',
                tagsOnly: true,
            });
        },
    },
};
</script>
