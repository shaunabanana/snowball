<template>
    <div class="workflow-node">
        <a-spin :loading="loading" tip="Running...">
            <a-card size="small" hoverable>
                <template #extra>
                    <a-button v-if="close" type="text" @click="$emit('delete')">
                        <template #icon>
                            <icon-close />
                        </template>
                    </a-button>
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
                    <slot ref="internal" @loading="loading = $event"/>
                    <a-divider orientation="left" :margin="5"/>
                    <a-textarea size="mini" placeholder="Notes" auto-size
                        v-model="noteContent"
                        @change="$store.commit('updateWorkflow', {
                            element: id,
                            updates: {
                                notes: $event
                            }
                        })"
                    />
                </a-space>
            </a-card>
        </a-spin>
        <HandleList type="target" position="left" :handles="inputs"/>
        <HandleList type="source" position="right" :handles="outputs"/>
        <!-- <Handle v-if="input && multiInput" id="input" type="target" class="port addport"
            :position="Position.Left"
        /> -->
        <!-- <Handle v-if="output" id="output" type="source" :position="Position.Right" class="port"
            :is-valid-connection="isValidConnection"
        /> -->
    </div>
</template>

<script>
// import { Position } from '@vue-flow/core';
import HandleList from './components/HandleList.vue';

export default {
    name: 'WorkflowNode',
    components: {
        // Handle,
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
    },

    data() {
        return {
            // Position,
            loading: false,
            noteContent: this.notes,
        };
    },

    methods: {
        isValidConnection(connection) {
            const edges = this.$store.state.workflow.filter(
                (el) => el.source === connection.source && el.target === connection.target,
            );
            return edges.length === 0;
        },
    },

    // computed: {
    //     inputs() {
    //         return 0;
    //     },
    // },
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
