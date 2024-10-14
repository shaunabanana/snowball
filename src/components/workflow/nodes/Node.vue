<template>
    <div class="workflow-node">
        <a-spin :loading="loading" tip="Running...">
            <a-card size="small" hoverable>
                <template #extra>
                    <a-popconfirm type="warning"
                        content="Are you sure you want to delete?"
                        okText="Delete" cancelText="No"
                        :ok-button-props="{
                            status: 'danger'
                        }"
                        @ok="deleteNode"
                    >
                        <a-button v-if="close" type="text">
                            <template #icon>
                                <icon-close />
                            </template>
                        </a-button>
                    </a-popconfirm>
                </template>
                <template #title>
                    <a-typography-title
                        :heading="6"
                        :editable="edit"
                        @change="$emit('change', $event)"
                    >
                        {{title}}
                    </a-typography-title>
                </template>
                <a-space direction="vertical">
                    <slot ref="internal"/>
                    <a-divider orientation="left" :margin="5"/>
                    <a-textarea size="mini" placeholder="Notes" auto-size
                        style="min-width: 20rem;"
                        :model-value="notes"
                        @input="store.workflowNode(id).data.notes = $event"
                        @keydown.stop
                        @keyup.stop
                        @mousedown.stop
                        @mouseup.stop
                    />
                </a-space>
            </a-card>
        </a-spin>
        <HandleList type="target" position="left" :handles="inputs"/>
        <HandleList type="source" position="right" :handles="outputs"/>
    </div>
</template>

<script>
import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';
import HandleList from './components/HandleList.vue';

export default {
    name: 'WorkflowNode',
    components: {
        HandleList,
    },
    emits: ['delete', 'change'],
    props: {
        id: String,
        title: String,
        inputs: Array,
        outputs: Array,
        close: Boolean,
        edit: Boolean,
        notes: String,
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    methods: {
        deleteNode() {
            this.store.workflow = this.store.workflow.filter(
                (element) => (
                    element.id !== this.id
                    && element.source !== this.id
                    && element.target !== this.id
                ),
            );
            writeProject(this.store);
            this.store.runWorkflow();
        },
    },
};
</script>

<style>
.node {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content:
    center; max-width: 90%;
    margin: auto;
    gap: 3px
}

.arco-card-header {
    padding-right: 4px !important;
}

h6.arco-typography {
    display: inline-block;
    margin-top: 0.5em !important;
    margin-bottom: 0.5em !important;
}

.arco-typography-edit-content {
    margin-bottom: 0 !important;
}
</style>
