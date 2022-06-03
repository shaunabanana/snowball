<template>
    <el-dialog
        v-model="modalVisible"
        title="Please wait..."
        :show-close="false"
        :close-on-click-modal="false"
    >
        <el-icon class="is-loading">
            <Loading />
        </el-icon>
        Loading large datasets may take a while.
    </el-dialog>
</template>

<script>

export default {
    name: "LoadingScreen",

    props: {
        show: {
            type: Boolean,
        },
    },

    data() {
        return {
            modalVisible: false,
        };
    },

    watch: {
        show() {
            console.log('Loading', this.show);
            this.modalVisible = this.show;
        },
    },
};
</script>