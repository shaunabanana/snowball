<template>
    <a-modal
        :visible="true"
        :closable="false"
        :simple="true"
        :mask-closable="false"
        :footer="false"
    >
        <template #title>
            Please wait...
        </template>
        <IconLoading spin /> Snowball is loading your project and running the workflow.
    </a-modal>
</template>

<script>
export default {
    name: 'LoadingWait',

    beforeUnmount() {
        this.$emit('unmount');
    },
};
</script>
