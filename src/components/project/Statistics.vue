<template>
    <a-space size="large" fill>
        <a-statistic title="Unique papers" :value="statistics.total" />
        <a-statistic title="Viewed" :value="statistics.viewed" />
        <a-statistic title="Included" :value="statistics.included" />
        <a-statistic title="Decisions made" :value="statistics.decisionRatio">
            <template #suffix>
                % ({{statistics.decided}} / {{statistics.total}})
            </template>
        </a-statistic>
    </a-space>
</template>

<script>
import useSnowballStore from '@/store';

export default {
    name: 'ProjectStatistics',
    setup: () => ({
        store: useSnowballStore(),
    }),
    computed: {
        statistics() {
            const total = new Set();
            const included = new Set();
            const decided = new Set();
            const viewed = new Set();

            this.store.sheets.forEach((sheet) => {
                const output = this.store.dataflow.output[sheet.id];
                if (!output || !output.papers) return;
                output.papers.forEach((paper) => {
                    total.add(paper.id);
                    if (paper.decision !== 'undecided') decided.add(paper.id);
                    if (paper.decision === 'include') included.add(paper.id);
                    if (sheet.data.edits[paper.id]) viewed.add(paper.id);
                });
            });

            const ratio = Math.ceil((decided.size / total.size) * 100);

            return {
                total: total.size,
                included: included.size,
                decided: decided.size,
                viewed: viewed.size,
                decisionRatio: ratio || 0,
            };
        },
    },
};
</script>
