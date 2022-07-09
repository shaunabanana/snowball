<template>
    <a-config-provider :locale="enUS">
        <a-layout class="app">
            <Menu v-if="$store.state.projectPath" v-model:item="currentScreen" />
            <LoadProject @done="showIdentity = true"/>
            <ConfigIdentity :visible="showIdentity" @confirm="showIdentity = false"/>
            <LoadingWait :visible="$store.state.loading"/>
            <ProjectScreen v-if="$store.state.projectPath && currentScreen === 'project'" />
            <PapersScreen v-if="$store.state.projectPath && currentScreen === 'screen'" />
        </a-layout>
    </a-config-provider>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { Message } from '@arco-design/web-vue';
import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
import log from 'electron-log';

import Menu from '@/components/main/Menu.vue';
import LoadProject from '@/components/main/LoadProject.vue';
import ConfigIdentity from '@/components/main/ConfigIdentity.vue';
import LoadingWait from '@/components/main/LoadingWait.vue';
import ProjectScreen from '@/components/project/Main.vue';
import PapersScreen from '@/components/papers/Main.vue';

const Store = require('electron-store');

// import Query from '@/search';

export default {
    name: 'App',
    components: {
        Menu,
        LoadProject,
        ConfigIdentity,
        LoadingWait,
        ProjectScreen,
        PapersScreen,
    },

    provide: {
        config: new Store(),
    },

    data() {
        return {
            enUS,
            currentScreen: 'project',
            projectPath: null,
            showIdentity: false,
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

        // document.body.setAttribute('arco-theme', 'dark');
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
    background: var(--color-bg-1);
}
</style>
