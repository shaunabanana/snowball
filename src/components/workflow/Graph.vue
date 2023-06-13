<template>
    <VueFlow ref="flow" v-model="store.workflow" style="width: 100%; height: 100%;"
        :node-types="nodeTypes"
        :default-edge-options="{
            type: 'default',
            updatable: true,
            style: edgeStyle
        }"
        :min-zoom="0.2"
        :max-zoom="1"
        :default-zoom="1"
        :fit-view-on-init="true"
        :snap-to-grid="true"
        :delete-key-code="null"
        :selection-key-code="null"
        :multi-selection-key-code="null"
    >
        <Background :size="0.1" :variant="BackgroundVariant.Lines" pattern-color="#eee" />
        <MiniMap v-if="minimap"/>
    </VueFlow>
</template>

<script>
import { markRaw } from 'vue';
import { VueFlow } from '@vue-flow/core';
import { Background, BackgroundVariant } from '@vue-flow/background';
// import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';

import useSnowballStore from '@/store';
import ImportPapersNode from './nodes/Import.vue';
import SheetNode from './nodes/Sheet.vue';
import ExportSheetNode from './nodes/Export.vue';
import SnowballNode from './nodes/Snowball.vue';
import MergeNode from './nodes/Merge.vue';
import FilterNode from './nodes/Filter.vue';
import TagNode from './nodes/Tag.vue';
import ScriptNode from './nodes/Script.vue';

// $emit('update:modelValue', $event)

export default {
    name: 'WorkflowGraph',
    components: {
        VueFlow,
        Background,
        // Controls,
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
        minimap: {
            type: Boolean,
            default: true,
        },
    },
    setup: () => ({
        store: useSnowballStore(),
    }),
    data() {
        return {
            BackgroundVariant,
            nodeTypes: {
                import: markRaw(ImportPapersNode),
                sheet: markRaw(SheetNode),
                export: markRaw(ExportSheetNode),
                merge: markRaw(MergeNode),
                snowball: markRaw(SnowballNode),
                filter: markRaw(FilterNode),
                tag: markRaw(TagNode),
                script: markRaw(ScriptNode),
            },
        };
    },

    computed: {
        edgeStyle() {
            return {
                strokeWidth: 2,
            };
        },
    },
};
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.selected .arco-card {
    border: 1px solid rgb(var(--primary-6));
    /* margin-left: -0.5px;
    margin-top: -0.5px; */
}
</style>
