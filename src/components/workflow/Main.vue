<template>
    <div style="width: 100%; height: 100%;">
        <Graph
            @pane-ready="flowReady"
            @connect="connectNodes"
            @nodes-change="save"
            @edge-update="updateEdge"
            @edges-change="disconnectNodes"
        />
        <Toolbar @create="createNode"/>
    </div>
</template>

<script>
import { customAlphabet } from 'nanoid';
import { numbers, lowercase } from 'nanoid-dictionary';
import { nextTick } from 'vue';

import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';
import Graph from './Graph.vue';
import Toolbar from './Toolbar.vue';

const nanoid = customAlphabet(lowercase + numbers, 14);

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

    mounted() {
        window.addEventListener('keyup', this.deleteSelectedEdges);
    },

    beforeUnmount() {
        window.removeEventListener('keyup', this.deleteSelectedEdges);
    },

    methods: {
        flowReady(flow) {
            this.flow = flow;
            this.store.flow = flow;
        },

        createNode(type) {
            console.log('Creating node with type', type);
            this.store.workflow.forEach((element) => {
                // eslint-disable-next-line no-param-reassign
                element.selected = false;
            });
            const centerPoint = {
                x: document.body.clientWidth / 2,
                y: document.body.clientHeight / 2,
            };
            const centerCoords = this.flow.project(centerPoint);

            this.store.workflow.push({
                id: `${type}-${nanoid()}`,
                type,
                position: { x: centerCoords.x - 180, y: centerCoords.y - 150 },
                selected: true,
                data: {},
            });
        },

        connectNodes(connection) {
            this.flow.addEdges([connection]);
            nextTick(() => {
                this.flow.updateNodeInternals([connection.source, connection.target]);
                this.store.runWorkflow(connection.source);
            });
        },

        updateEdge({ edge, connection }) {
            this.flow.updateEdge(edge, connection);
            this.flow.setNodes(this.flow.nodes);
            this.store.runWorkflow(connection.source);
            console.log(this.store.workflow);
        },

        disconnectNodes(events) {
            events.forEach((event) => {
                if (event.type !== 'remove') return;
                console.log(this.flow.edges.find((edge) => edge.id === event.id));
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

        deleteSelectedEdges(event) {
            if (this.store.screen !== 'workflow') return;
            if (event.key !== 'Backspace') return;

            const selectedEdges = this.flow.edges
                .filter((edge) => edge.selected)
                .map((edge) => edge.id);
            if (selectedEdges.length === 0) return;

            this.store.workflow = this.store.workflow.filter(
                (element) => !selectedEdges.includes(element.id),
            );
            nextTick(() => {
                this.store.runWorkflow();
            });
        },

        save(changes) {
            if (changes.every((c) => c.type !== 'select' && c.type !== 'dimensions')) {
                writeProject(this.store);
            }
        },
    },
};
</script>
