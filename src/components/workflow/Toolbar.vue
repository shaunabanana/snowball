<template>
    <a-space class="toolbar">
        <!-- {{$store.state.workflow}} -->

        <a-space direction="vertical" size="mini">
            <div style="color: gray; font-size: 0.9em">
                Basic functions
            </div>
            <a-button-group size="small">
                <a-button @click="$emit('create', 'import')">
                    <template #icon><icon-import /></template>
                    Import
                </a-button>
                <a-button @click="$emit('create', 'sheet')">
                    <template #icon><icon-plus /></template>
                    Sheet
                </a-button>
                <a-button @click="$emit('create', 'export')">
                    <template #icon><icon-export /></template>
                    Export
                </a-button>
            </a-button-group>
        </a-space>

        <a-space direction="vertical" size="mini">
            <div style="color: gray; font-size: 0.9em">
                Paper operations
            </div>
            <a-button-group size="small">
                <a-button @click="$emit('create', 'merge')">
                    <template #icon><icon-copy /></template>
                    Merge
                </a-button>
                <a-button @click="$emit('create', 'filter')">
                    <template #icon><icon-search /></template>
                    Filter
                </a-button>
                <a-button @click="$emit('create', 'tag')">
                    <template #icon><icon-tag /></template>
                    Tag
                </a-button>
            </a-button-group>
        </a-space>

        <a-space direction="vertical" size="mini">
            <div style="color: gray; font-size: 0.9em">
                Snowballing
            </div>
            <a-button-group size="small">
                <a-button @click="$emit('create', 'snowball')">
                    <template #icon><icon-play-arrow /></template>
                    Snowball
                </a-button>
                <a-tooltip content="Functionality coming soon!" position="bottom">
                    <a-button @click="$emit('create', 'graph')" disabled>
                        <template #icon><icon-relation /></template>
                        Graph
                    </a-button>
                </a-tooltip>
            </a-button-group>
        </a-space>

        <a-space direction="vertical" size="mini">
            <div style="color: gray; font-size: 0.9em">
                Other
            </div>
            <a-button-group size="small">
                <a-button @click="$emit('create', 'boolean')">
                    <template #icon><icon-interaction /></template>
                    Boolean
                </a-button>

                <a-tooltip content="Functionality coming soon!" position="bottom">
                    <a-button @click="$emit('create', 'script')" disabled>
                        <template #icon><icon-code /></template>
                        Script
                    </a-button>
                </a-tooltip>
            </a-button-group>
        </a-space>

        <!-- <a-button-group size="small">
            <a-button @click="$emit('create', 'script')">
                <template #icon><icon-code-block /></template>
                Custom script
            </a-button>
        </a-button-group> -->
    </a-space>
</template>

<script>
export default {
    name: 'WorkflowToolbar',
};
</script>

<style>
.toolbar {
    position: absolute;
    top: 0;
    margin: 0.5rem;
    z-index: 1000;
}
</style>
