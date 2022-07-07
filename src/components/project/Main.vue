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
                <a-col :span="8">
                    <a-card title="Statistics" :bordered="false" style="width: 100%; height: 100%">
                        <Statistics />
                    </a-card>
                </a-col>
                <a-col :span="8">
                    <a-card
                        title="Collaborators"
                        :bordered="false"
                        style="width: 100%; height: 100%"
                    >
                        <a-space wrap>
                            <a-avatar>A</a-avatar>
                            <a-avatar>B</a-avatar>
                            <a-avatar>C</a-avatar>
                            <a-avatar>D</a-avatar>
                            <a-avatar>E</a-avatar>
                            <a-avatar>F</a-avatar>
                        </a-space>
                    </a-card>
                </a-col>
            </a-row>
            <a-row :gutter="12" :wrap="false" style="flex-grow: 2; align-items: stretch">
                <a-col :span="16">
                    <a-card
                        title="Review history"
                        :bordered="false"
                        style="width: 100%; height: 100%"
                    >
                        <template #extra>
                            <a-link>Fullscreen</a-link>
                        </template>
                        Card content
                    </a-card>
                </a-col>
                <a-col :span="8">
                    <a-card
                        title="Unresolved Conversations"
                        :bordered="false"
                        style="width: 100%; height: 100%"
                    >
                        <template #extra>
                            <a-link>More</a-link>
                        </template>

                        <a-list hoverable :bordered="false" :max-height="550">
                            <a-list-item v-for="i of [1, 2, 3, 4, 5]" :key="i">
                                <a-comment
                                    align="right"
                                    author="Socrates"
                                    content="Comment body content."
                                    datetime="in Zhang et al. (2021) Patterns..."
                                >
                                    <template #avatar>
                                        <a-avatar>
                                            <img
                                                alt="avatar"
                                                src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp"
                                            />
                                        </a-avatar>
                                    </template>
                                    <a-comment
                                        v-if="i === 5"
                                        align="right"
                                        avatar="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp"
                                    >
                                        <template #actions>
                                            <a-button key="0" type="secondary"> Cancel </a-button>
                                            <a-button key="1" type="primary"> Reply </a-button>
                                        </template>
                                        <template #content>
                                            <a-input placeholder="Here is you content." />
                                        </template>
                                    </a-comment>
                                </a-comment>
                            </a-list-item>
                        </a-list>
                    </a-card>
                </a-col>
            </a-row>
        </a-layout>
    </a-layout>
</template>

<script>
import Statistics from './Statistics.vue';
import Descriptions from './Descriptions.vue';

export default {
    name: 'ProjectScreen',
    components: {
        Statistics,
        Descriptions,
    },

    // props: {
    //     data: Array,
    // },

    data() {
        return {
            title: 'Project Title',
        };
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
</style>
