<script setup>
import { ref, computed } from 'vue';

import useSnowballStore from '@/store';

import Node from './components/Node.vue';
import GraphView from './components/GraphView.vue';
import TimelineView from './components/TimelineView.vue';

const props = defineProps({
    id: String,
    data: Object,
});
const modal = ref(false);
const mode = ref("timeline");
const title = ref("");

const store = useSnowballStore();

const seeds = computed(() => {
    const workflowInput = store.dataflow.input[props.id];
    if (
        !workflowInput
        || !workflowInput.papers
    ) {
        return [];
    }
    return workflowInput.seeds;
})

const papers = computed(() => {
    const workflowInput = store.dataflow.input[props.id];
    if (
        !workflowInput
        || !workflowInput.papers
    ) {
        return [];
    }
    return workflowInput.papers;
})

const relations = computed(() => {
    const workflowInput = store.dataflow.input[props.id];
    if (
        !workflowInput
        || !workflowInput.papers
        || !workflowInput.graph
    ) {
        return [];
    }
    console.log(workflowInput.graph)
    return workflowInput.graph
})
</script>

<template>
    <Node :id="id" title="Graph paper relations" output close
        :loading="data.loading"
        :inputs="[
            { id: 'seeds', type: 'papers', text: 'Seed Papers', class: 'data' },
            { id: 'papers', type: 'papers', text: 'Cited Papers', class: 'data' },
            { id: 'graph', type: 'graph', text: 'Graph: Relations among the papers', class: 'graph' },
        ]"
        :notes="data.notes"
    >
        <a-space direction="vertical" fill>
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="Paper count">
                    {{ total }}
                </a-descriptions-item>
            </a-descriptions>
            <a-space direction="vertical" fill>
                <a-button size="small" type="primary" long
                    :disabled="false"
                    @click="modal = true"
                >
                    Show graph
                </a-button>
                <a-modal 
                    body-class="citation-graph-container" 
                    :fullscreen="true" 
                    :closable="true" 
                    :visible="modal"
                    :unmount-on-close="true"
                    @cancel="modal = false"
                >
                    <template #title>
                        <a-radio-group type="button" v-model="mode">
                            <a-radio value="timeline">Timeline View</a-radio>
                            <a-radio value="graph">Graph View</a-radio>
                        </a-radio-group>
                    </template>
                    <template #footer>
                        <div style="text-align: left;">{{ title }}</div>
                    </template>
                    <TimelineView
                        v-if="mode === 'timeline'"
                        :seeds="seeds"
                        :papers="papers"
                        :relations="relations"
                        @hover="title=$event"
                    />
                    <GraphView
                        v-else
                        :seeds="seeds"
                        :papers="papers"
                        :relations="relations"
                        @hover="title=$event"
                    />
                </a-modal>
            </a-space>
        </a-space>
    </Node>
</template>

<style>
.citation-graph-container {
    height: 100%;
    overflow: scroll;
}
/* .citation-graph-container svg {
    width: 100vw;
    height: 100vh;
} */
</style>