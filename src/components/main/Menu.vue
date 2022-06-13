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
            :default-selected-keys="['project']"
            :style="{ width: '100%' }"
            @menu-item-click="onClickMenuItem"
        >
            <a-menu-item key="project">
                <IconHome></IconHome>
                Project
            </a-menu-item>
            <a-menu-item key="screening">
                <IconFile></IconFile>
                Screening
            </a-menu-item>
            <a-menu-item key="settings">
                <IconSettings></IconSettings>
                Settings
            </a-menu-item>
        </a-menu>
    </a-layout-sider>
</template>

<script>
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { IconHome, IconFile, IconSettings } from '@arco-design/web-vue/es/icon';

export default {
    name: 'MainMenu',
    components: {
        IconHome,
        IconFile,
        IconSettings,
    },

    setup() {
        return {
            collapsed: ref(true),
        };
    },

    methods: {
        onClickMenuItem(key) {
            Message.info({ content: `You select ${key}`, showIcon: true });
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
