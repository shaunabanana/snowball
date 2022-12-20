<template>
    <VueFlow ref="flow" v-model="store.workflow"
        :node-types="nodeTypes"
        :default-edge-options="{
            type: 'smoothstep',
            updatable: true,
            style: {
                strokeWidth: 2
            }
        }"
        :min-zoom="0.2"
        :max-zoom="1"
        :default-zoom="1"
        :fit-view-on-init="true"
        :snap-to-grid="true"
    >
        <Background :variant="BackgroundVariant.Lines" pattern-color="#eee" />
        <Controls />
        <MiniMap />
    </VueFlow>
</template>

<script>
import { markRaw } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Background, BackgroundVariant } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';

import useSnowballStore from '@/store';
import ImportPapersNode from './nodes/ImportPapers.vue';
import SheetNode from './nodes/Sheet.vue';
import ExportSheetNode from './nodes/ExportSheet.vue';
import SnowballNode from './nodes/Snowball.vue';
import MergeNode from './nodes/Merge.vue';

// $emit('update:modelValue', $event)

export default {
    name: 'WorkflowGraph',
    components: {
        VueFlow,
        Background,
        Controls,
        MiniMap,
        // ImportPapersNode,
        // SheetNode,
        // ExportSheetNode,
        // SnowballNode,
        // MergeNode,
    },
    props: {
        editable: {
            type: Boolean,
            default: false,
        },
    },
    setup: () => ({
        store: useSnowballStore(),
    }),
    data() {
        return {
            BackgroundVariant,
            nodeTypes: {
                'import-papers': markRaw(ImportPapersNode),
                sheet: markRaw(SheetNode),
                'export-sheet': markRaw(ExportSheetNode),
                merge: markRaw(MergeNode),
                snowball: markRaw(SnowballNode),
            },
        };
    },
};
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
