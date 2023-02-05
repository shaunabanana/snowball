<template>
    <a-tooltip v-for="(handle, index) in handles" :key="handle.text" mini
        :position="position.toLowerCase()"
        :content="handle.text"
    >
        <Handle :id="`__${handle.type}_${handle.id}`" :type="type" class="port"
            :connectable="type === 'target' ? 'single' : undefined"
            :position="Position[positionProperty]"
            :class="handle.class"
            :style="{
                ...handle.style,
                transform: `translate(0, ${(index - handles.length / 2) * spacing}px)`
            }"
            :is-valid-connection="isValidConnection"
        />
    </a-tooltip>
</template>

<script>
import { Handle, Position } from '@vue-flow/core';
import useSnowballStore from '@/store';

export default {
    components: {
        Handle,
    },
    props: {
        handles: Array,
        type: String,
        position: String,
        spacing: {
            type: Number,
            default: 20,
        },
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    data() {
        return {
            Position,
        };
    },

    methods: {
        isValidConnection(connection) {
            const edges = this.store.workflow.filter(
                (el) => el.source === connection.source
                    && el.target === connection.target
                    && el.sourceHandle === connection.sourceHandle,
            );
            if (edges.length > 0) return false;
            const sourceType = connection.sourceHandle.replace(/^__/, '').split('_')[0];
            const targetType = connection.targetHandle.replace(/^__/, '').split('_')[0];
            console.log(sourceType, targetType);
            return sourceType === targetType;
        },
    },

    computed: {
        positionProperty() {
            return this.position.toLowerCase().charAt(0).toUpperCase()
                + this.position.toLowerCase().slice(1);
        },
    },
};
</script>

<style scoped>
.port {
    width: 6px !important;
    height: 6px !important;
    border: 1px solid black !important;
}

.port.data {
    width: 6px !important;
    height: 6px !important;
    border: 1px solid rgb(var(--primary-6)) !important;
    background: rgb(var(--primary-6)) !important;
    border-radius: 2px !important;
}
</style>
