<template>
    <a-space class="toolbar">
        <!-- {{$store.state.workflow}} -->

        <a-button-group size="small">
            <a-button @click="$emit('create', 'import-papers')">
                <template #icon><icon-import /></template>
                Import
            </a-button>
            <a-button @click="$emit('create', 'merge')">
                <template #icon><icon-copy /></template>
                Merge
            </a-button>
            <a-button @click="$emit('create', 'sheet')">
                <template #icon><icon-scan /></template>
                Screen
            </a-button>
            <a-button @click="$emit('create', 'export-sheet')">
                <template #icon><icon-export /></template>
                Export
            </a-button>
        </a-button-group>

        <!-- <a-button-group size="small">
            <a-button @click="$emit('create', 'filter')">
                <template #icon><icon-search /></template>
                Filter
            </a-button>
        </a-button-group> -->

        <!-- <a-button-group size="small">
            <a-button @click="$emit('create', 'snowball')">
                <template #icon><icon-play-arrow /></template>
                Snowball
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
