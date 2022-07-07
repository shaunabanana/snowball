<template>
    <a-tabs size="medium" editable :default-active-key="$store.state.activeSheet"
        v-model="activeSheet"
        @change="$store.commit('setActiveSheet', $event)"
    >
        <a-tab-pane v-for="sheet of $store.state.sheets" :key="sheet.id"
            :closable="sheet.id !== 'core'"
        >
            <template #title>
                <a-typography-paragraph
                    v-model:editText="sheet.name"
                    style="margin-bottom: 0"
                    :editable="sheet.id !== 'core' && sheet.id === $store.state.activeSheet"
                >
                    {{ sheet.name }}
                </a-typography-paragraph>
            </template>
        </a-tab-pane>
    </a-tabs>
</template>

<script>
export default {
    name: 'PaperTabs',
    components: {},

    data() {
        return {
            activeSheet: 'core',
        };
    },

    watch: {
        // eslint-disable-next-line func-names
        '$store.state.activeSheet': function () {
            this.activeSheet = this.$store.state.activeSheet;
        },
    },
};
</script>

<style lang="scss"></style>
