<template>
    <a-layout-sider
        collapsible
        hide-trigger
        breakpoint="xl"
        :collapsed="collapsed"
        @mouseenter="collapsed = false"
        @focusin="collapsed = false"
        @mouseleave="collapsed = true"
        @focusout="collapsed = true"
    >
        <a-menu
            :selected-keys="selectedKeys"
            :default-selected-keys="['project']"
            :style="{ width: '100%' }"
            @menu-item-click="onClickMenuItem"
        >
            <a-menu-item key="project">
                <icon-home />
                Project
            </a-menu-item>
            <a-menu-item key="screen">
                <icon-scan />
                Screen
            </a-menu-item>
            <!-- <a-tooltip content="Functionality coming soon!" position="right">
                <a-menu-item key="compare" disabled>
                    <icon-mind-mapping />
                    Compare
                </a-menu-item>
            </a-tooltip>

            <a-tooltip content="Functionality coming soon!" position="right">
            <a-menu-item key="results" disabled>
                <icon-file />
                Results
            </a-menu-item>
            </a-tooltip> -->

            <a-tooltip content="Functionality coming soon!" position="right">
                <a-menu-item key="settings" disabled>
                    <icon-settings />
                    Settings
                </a-menu-item>
            </a-tooltip>
        </a-menu>
    </a-layout-sider>
</template>

<script>
import { ref } from 'vue';

export default {
    name: 'MainMenu',
    components: { },

    props: {
        item: {
            type: String,
            default: 'project',
        },
    },

    setup() {
        return {
            collapsed: ref(true),
        };
    },

    methods: {
        onClickMenuItem(key) {
            this.$emit('update:item', key);
        },
    },

    computed: {
        selectedKeys() {
            return [this.item];
        },
    },
};
</script>

<style lang="scss">
html,
body,
#app,
.app {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
