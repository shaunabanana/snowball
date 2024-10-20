<template>
  <a-config-provider :locale="enUS">
      <a-layout class="app">
          <Menu v-if="store.projectPath" v-model:item="store.screen" />
          <LoadProject @done="showIdentity = true"/>
          <ConfigIdentity
              :visible="showIdentity"
              @confirm="showIdentity = false; loaded = true; wait = true"
          />
          <LoadingWait v-if="wait && store.running" @unmount="wait = false" />
          <ProjectScreen v-if="loaded" v-show="store.screen === 'project'" />
          <WorkflowScreen v-if="loaded" v-show="store.screen === 'workflow'" />
          <PapersScreen v-if="loaded" v-show="store.screen === 'screen'" />
      </a-layout>
  </a-config-provider>
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import { mapStores } from 'pinia';

import { Message } from '@arco-design/web-vue';
import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
// import log from 'electron-log';

import Menu from '@/components/main/Menu.vue';
import LoadProject from '@/components/main/LoadProject.vue';
import ConfigIdentity from '@/components/main/ConfigIdentity.vue';
import LoadingWait from '@/components/main/LoadingWait.vue';
import ProjectScreen from '@/components/project/Main.vue';
import WorkflowScreen from '@/components/workflow/Main.vue';
import PapersScreen from '@/components/papers/Main.vue';

import useSnowballStore from '@/store';

import Store from 'electron-store';

// import Query from '@/search';

export default {
  name: 'App',
  components: {
      Menu,
      LoadProject,
      ConfigIdentity,
      LoadingWait,
      ProjectScreen,
      WorkflowScreen,
      PapersScreen,
  },

  setup: () => ({
      store: useSnowballStore(),
  }),

  provide: {
      config: new Store(),
  },

  data() {
      return {
          enUS,
          projectPath: null,
          showIdentity: false,
          wait: false,
          loaded: false,
      };
  },

  mounted() {
      console.log(mapStores(useSnowballStore));
      window.onerror = (message) => {
          if (message === 'ResizeObserver loop limit exceeded') return;
          Message.error(message);
      };

      // Object.assign(console, log.functions);

      ipcRenderer.invoke('get-version').then((version) => {
          this.store.version = version;
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
