<template>
    <a-layout style="overflow: hidden" ref="mainContainer" id="main-container">
        <a-layout-header style="padding-left: 20px">
            <!-- <Tabs /> -->
        </a-layout-header>
        <a-layout style="padding: 2rem;">
            <!-- <a-row :gutter="12" style="margin-left: 1rem">
                <a-typography-title
                    editable
                    bold
                    :heading="4"
                    v-model:edit-text="title"
                    style="margin-top: 0rem"
                >
                    {{ title }}
                </a-typography-title>
            </a-row> -->
            <a-row :gutter="12" :wrap="false" style="align-items: stretch; padding-bottom: 1rem">
                <a-col :span="8">
                    <a-card title="Metadata" :bordered="false" style="width: 100%; height: 100%">
                        <Descriptions />
                    </a-card>
                </a-col>
                <a-col :span="10">
                    <a-card title="Statistics" :bordered="false" style="width: 100%; height: 100%">
                        <Statistics />
                    </a-card>
                </a-col>
                <a-col :span="6">
                    <a-card
                        title="Collaborators"
                        :bordered="false"
                        style="width: 100%; height: 100%"
                    >
                        <Collaborators />
                    </a-card>
                </a-col>
            </a-row>
            <a-row ref="bottomRow"
                style="flex-grow: 1; align-items: stretch"
                :gutter="12" :wrap="false"
            >
                <a-col :span="16">
                    <a-card
                        title="Project Notes"
                        class="note-editor"
                        :bordered="false"
                        :body-style="{
                            width: 'calc(100% - 2rem)',
                            height: `${bottomRowHeight - 80}px`,
                            'overflow-y': 'hidden',
                        }"
                    >
                        <NoteEditor v-model="store.notes" @update:modelValue="saveNotes"/>
                    </a-card>
                </a-col>
                <a-col :span="8">
                    <a-card
                        title="Recent Discussions"
                        :bordered="false"
                        :body-style="{
                            width: 'calc(100% - 2rem)',
                            height: `${bottomRowHeight - 80}px`,
                            'overflow-y': 'scroll',
                        }"
                    >
                        <RecentComments />
                    </a-card>
                </a-col>
            </a-row>
        </a-layout>
    </a-layout>
</template>

<script>
import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';

import RecentComments from '@/components/comments/RecentComments.vue';
import Statistics from './Statistics.vue';
import Descriptions from './Descriptions.vue';
import NoteEditor from './NoteEditor.vue';
import Collaborators from './Collaborators.vue';

export default {
    name: 'ProjectScreen',
    components: {
        Statistics,
        Descriptions,
        NoteEditor,
        RecentComments,
        Collaborators,
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    data() {
        return {
            title: 'Project Title',
            bottomRowHeight: 0,
            observer: null,
        };
    },

    mounted() {
        this.observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                this.bottomRowHeight = entry.contentRect.height;
            });
        });
        this.observer.observe(this.$refs.bottomRow.$el);
    },

    methods: {
        saveNotes() {
            writeProject(this.store);
        },
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

.action {
    display: inline-block;
    padding: 0 4px;
    color: var(--color-text-1);
    line-height: 24px;
    background: transparent;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.1s ease;
}
.action:hover {
    background: var(--color-fill-3);
}

.note-editor {
    width: 100%;
    height: 100%;
}
</style>
