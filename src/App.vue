<template>
    <a-layout class="app">
        <Menu v-if="$store.state.projectPath" v-model:item="currentScreen" />
        <LoadProject />
        <LoadingWait :visible="$store.state.loading"/>
        <ProjectScreen v-if="$store.state.projectPath && currentScreen === 'project'" />
        <PapersScreen v-if="$store.state.projectPath && currentScreen === 'screening'" />
    </a-layout>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { Message } from '@arco-design/web-vue';
import log from 'electron-log';

import Menu from '@/components/main/Menu.vue';
import LoadProject from '@/components/main/LoadProject.vue';
import LoadingWait from '@/components/main/LoadingWait.vue';
import ProjectScreen from '@/components/project/Main.vue';
import PapersScreen from '@/components/papers/Main.vue';

// import Query from '@/search';

export default {
    name: 'App',
    components: {
        Menu,
        LoadProject,
        LoadingWait,
        ProjectScreen,
        PapersScreen,
    },

    data() {
        return {
            currentScreen: 'screening',
            projectPath: null,
        };
    },

    mounted() {
        window.onerror = (message) => {
            if (message === 'ResizeObserver loop limit exceeded') return;
            Message.error(message);
        };

        Object.assign(console, log.functions);

        ipcRenderer.invoke('get-version').then((version) => {
            this.$store.commit('setVersion', version);
        });
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
