<template>
    <a-layout class="app">
        <Menu v-model:item="currentScreen" />
        <ProjectScreen v-if="currentScreen === 'project'" />
        <PapersScreen v-if="currentScreen === 'screening'" />
    </a-layout>
</template>

<script>
import { Message } from '@arco-design/web-vue';

import Menu from '@/components/main/Menu.vue';
import ProjectScreen from '@/components/project/Main.vue';
import PapersScreen from '@/components/papers/Main.vue';

import Query from '@/search';

export default {
    name: 'App',
    components: {
        Menu,
        ProjectScreen,
        PapersScreen,
    },

    data() {
        return {
            currentScreen: 'project',
        };
    },

    mounted() {
        window.onerror = (message) => {
            if (message === 'ResizeObserver loop limit exceeded') return;
            Message.error(message);
        };

        const query = new Query(
            'ro?ot NEAR/3 knowledge',
        );
        console.log(
            query.search(
                'knowledge of robots',
            ),
        );
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
