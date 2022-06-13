<template>
    <a-layout class="app">
        <Menu />
        <PapersScreen />
    </a-layout>
</template>

<script>
import Menu from '@/components/main/Menu.vue';
import PapersScreen from '@/components/papers/Main.vue';

export default {
    name: 'App',
    components: {
        Menu,
        PapersScreen,
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
