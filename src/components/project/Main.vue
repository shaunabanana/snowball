<template>
    <a-layout style="overflow: hidden" ref="mainContainer" id="main-container">
        <a-layout-header style="padding-left: 20px">
            <!-- <Tabs /> -->
        </a-layout-header>
        <a-layout style="padding: 0 0 0 24px">
            <a-layout-content> Hi! </a-layout-content>
            <!-- <a-layout-footer>Footer</a-layout-footer> -->
        </a-layout>
    </a-layout>
</template>

<script>
export default {
    name: 'ProjectScreen',
    components: {},

    // props: {
    //     data: Array,
    // },

    data() {
        return {};
    },
};
</script>

<style scoped>
.table-container {
    overflow: hidden;
}

.arco-split-trigger-icon-wrapper {
    background-color: white !important;
}
</style>
