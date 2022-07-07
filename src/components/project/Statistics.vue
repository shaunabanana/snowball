<template>
    <a-space size="large" fill>
        <a-statistic title="Total" :value="totalCount" />
        <a-statistic title="Included" :value="includedCount" />
        <a-statistic title="Decisions made" :value="decisionRatio">
            <template #suffix>
                % ({{decidedCount}} / {{totalCount}})
            </template>
        </a-statistic>
    </a-space>
</template>

<script>
export default {
    name: 'ProjectStatistics',
    computed: {
        includedCount() {
            return this.$store.getters.included.length;
        },

        decidedCount() {
            return this.$store.getters.decided.length;
        },

        totalCount() {
            return Object.keys(this.$store.state.papers).length;
        },

        decisionRatio() {
            return Math.ceil((this.decidedCount / this.totalCount) * 100);
        },
    },
};
</script>
