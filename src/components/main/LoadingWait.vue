<template>
    <a-modal
        :visible="visible"
        :closable="false"
        :simple="true"
        :mask-closable="false"
        :footer="false"
    >
        <template #title>
            Please wait...
        </template>
        <IconLoading spin /> Loading large datasets may take a while.
    </a-modal>
</template>

<script>
export default {
    name: 'LoadingWait',
    props: {
        visible: Boolean,
    },
};
</script>
