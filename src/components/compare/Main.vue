<template>
    Hello!
</template>

<script>
import { compareBranches } from '@/utils/git';

export default {
    name: 'CompareScreen',

    mounted() {
        this.$store.commit('setLoading', true);
        compareBranches(this.$store.state).then((results) => {
            console.log(results);
            this.$store.commit('setLoading', false);
        });
    },
};
</script>
