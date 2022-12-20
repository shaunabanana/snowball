<template>
    <div style="width: 100%; height: 100%;">
        <Graph
            @pane-ready="flow = $event"
            @connect="connectNodes"
            @edge-update="updateEdge"
            @edges-change="disconnectNodes"
        />
        <Toolbar @create="createNode"/>
    </div>
</template>

<script>
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';
import { nextTick } from 'vue';

import useSnowballStore from '@/store';
import Graph from './Graph.vue';
import Toolbar from './Toolbar.vue';

const nanoid = customAlphabet(alphanumeric);

export default {
    name: 'WorkflowScreen',
    components: { Graph, Toolbar },
    setup: () => ({
        store: useSnowballStore(),
    }),
    data() {
        return {
            flow: null,
        };
    },

    methods: {
        createNode(type) {
            console.log('Creating node with type', type);
            this.store.workflow.push({
                id: nanoid(),
                type,
                position: { x: 0, y: 0 },
                data: {
                    input: null,
                    output: null,
                },
            });
        },

        connectNodes(connection) {
            console.log(connection);
            this.flow.addEdges([connection]);
            nextTick(() => {
                console.log('updating internals');
                this.flow.updateNodeInternals([connection.source, connection.target]);
                this.store.runWorkflow(connection.source);
            });
        },

        updateEdge({ edge, connection }) {
            this.flow.updateEdge(edge, connection);
            this.flow.setNodes(this.flow.nodes);
            this.store.runWorkflow(connection.source);
        },

        disconnectNodes(events) {
            events.forEach((event) => {
                if (event.type !== 'remove') return;
                console.log(event.id);
                const [sourceWithHandle, targetWithHandle] = event.id
                    .replace(/^vueflow__edge-/, '')
                    .replace(/input$/, '')
                    .split('-');
                console.log(sourceWithHandle, targetWithHandle);
                const [source, sourceHandle] = sourceWithHandle.split('__');
                const [target, targetHandle] = targetWithHandle.split('__');
                nextTick(() => {
                    this.flow.updateNodeInternals([source, target]);
                });
                console.log(source, sourceHandle, target, targetHandle);
            });
        },
    },
};
</script>
