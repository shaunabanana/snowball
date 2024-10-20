<template>
    <Node title="Set tag" close
        :id="id"
        :loading="data.loading"
        :inputs="[
            { id: 'papers', type: 'papers', text: 'Papers', class: 'data' },
            { id: 'selection', type: 'selection', text: 'Selection: Select specific papers to tag'},
        ]"
        :outputs="[
            { id: 'papers', type: 'papers', text: 'Papers', class: 'data'},
            { id: 'tagged', type: 'selection', text: 'Selection: Papers that were tagged'},
        ]"
        :notes="data.notes"
    >
        <a-space direction="vertical">
        <a-descriptions size="small" :column="1">
            <a-descriptions-item label="Name">
                <a-input
                    size="small"
                    placeholder="Enter tag name..."
                    :model-value="data.name"
                    @input="update('name', $event)"
                    @mousedown.stop
                    @keydown.stop
                />
            </a-descriptions-item>

            <a-descriptions-item label="Color">
                <a-dropdown @select="update('color', $event)">
                    <a-tag size="large" style="cursor: pointer"
                        :color="data.color"
                    >
                        {{data.color}}
                    </a-tag>
                    <template #content>
                        <a-doption v-for="colorName of colors" :key="colorName" :value="colorName">
                            <!-- <icon-check v-if="tagColor === colorName"/> -->
                            <a-tag :color="colorName">{{ colorName }}</a-tag>
                        </a-doption>
                    </template>
                </a-dropdown>
            </a-descriptions-item>

            <a-descriptions-item label="Tagged papers">
                {{ taggedCount }}
            </a-descriptions-item>

            <!-- <a-descriptions-item label="Unique papers only">
                        <a-switch type="round" size="small"/>
                    </a-descriptions-item> -->
        </a-descriptions>

        <a-button size="small" type="primary" long
            :disabled="!store.dataflow.input[this.id] || !store.dataflow.input[this.id].data"
            @click="handleInput"
        >
            Add tag
        </a-button>

        </a-space>
    </Node>
</template>

<script>
// import { nanoid } from 'nanoid';
import useSnowballStore from '@/store';
import writeProject from '@/utils/persistence';
import Node from './components/Node.vue';

export default {
    name: 'SheetNode',
    components: {
        Node,
    },
    props: {
        id: String,
        data: Object,
    },
    setup: () => ({
        store: useSnowballStore(),
    }),

    data() {
        return {
            colors: [
                'red',
                'orangered',
                'orange',
                'gold',
                'lime',
                'green',
                'cyan',
                'blue',
                'purple',
                'pinkpurple',
                'magenta',
                'gray',
            ],
        };
    },

    mounted() {
        const nodeData = this.store.workflowNode(this.id).data;
        nodeData.run = this.handleInput.bind(this);
        if (!this.data.name) {
            nodeData.name = null;
        }
        if (!this.data.color) {
            nodeData.color = 'blue';
        }
        this.worker = new Worker(new URL('./workers/tag.js', import.meta.url), {
            type: 'module',
        });
        this.handleInput();
    },

    methods: {

        update(key, value) {
            this.store.workflowNode(this.id).data[key] = value;
        },

        handleInput() {
            if (
                !this.store.dataflow.input[this.id]
                || !this.store.dataflow.input[this.id].papers
                || !this.data.name
                || this.data.name.length === 0
            ) {
                this.store.dataflow.output[this.id] = {};
                this.store.runWorkflow(this.id);
                return;
            }

            const nodeData = this.store.workflowNode(this.id).data;

            nodeData.loading = true;

            const nodeInput = this.store.dataflow.input[this.id];

            const existingTag = this.store.tag(this.data.name);
            if (!existingTag) {
                this.store.tags.push({
                    id: this.data.name,
                    type: 'text',
                    color: this.data.color,
                    text: this.data.name,
                });
                this.store.updateTags();
            } else {
                existingTag.color = this.data.color;
            }

            this.worker.postMessage(JSON.stringify({
                papers: nodeInput.papers,
                selection: nodeInput.selection,
                name: this.data.name,
            }));
            this.worker.onmessage = ({ data }) => {
                console.log(data);
                this.store.dataflow.output[this.id] = {
                    papers: data.papers,
                    tagged: data.tagged,
                };

                console.log(`[Tag@${this.id}][handleInput] Input contains ${data.papers.length} papers. Tagged ${data.tagged.length} papers.`);
                nodeData.loading = false;

                this.store.runWorkflow(this.id);
                writeProject(this.store);
            };
            this.worker.onerror = (error) => {
                console.log('Error displaying sheet.', error);
                this.$message.error(error.message);
                this.error = true;
                nodeData.loading = false;
            };
        },
    },

    computed: {
        taggedCount() {
            return this.store.dataflow.output[this.id]
                && this.store.dataflow.output[this.id].tagged
                && Array.isArray(this.store.dataflow.output[this.id].tagged)
                ? this.store.dataflow.output[this.id].tagged.length
                : 'N/A';
        },
    },
};
</script>

<style scoped>
.node {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content:
    center; max-width: 90%;
    margin: auto;
    gap: 3px
}
</style>
