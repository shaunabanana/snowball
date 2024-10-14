<template>
    <Node title="Import papers" output close
        :id="id"
        :loading="data.loading"
        :notes="data.notes"
        :outputs="[
            { id: 'papers', text: 'Imported papers', type: 'papers', class: 'data' },
            { id: 'selection', text: 'Selection: All imported papers', type: 'selection' }
        ]"
    >
        <a-space direction="vertical">
            <a-descriptions size="small" :column="1">
                <a-descriptions-item label="File">
                    {{ data.path ? fileName : 'Not set' }}
                </a-descriptions-item>
                <a-descriptions-item label="Location">
                    {{ data.path ? fileLocation : 'Not set' }}
                </a-descriptions-item>
                <a-descriptions-item label="Paper count">
                    {{
                        store.dataflow.output[this.id]
                        && store.dataflow.output[this.id].papers
                        ? store.dataflow.output[this.id].papers.length
                        : 'N/A'
                    }}
                </a-descriptions-item>
            </a-descriptions>

            <a-space fill>
                <a-button size="small" :type="data.path ? 'secondary' : 'primary'"
                    @click="openFile"
                >
                    Open
                </a-button>
                <a-button size="small" :type="data.path ? 'primary' : 'secondary'"
                    :disabled="!data.path"
                    @click="reload"
                >
                    Reload
                </a-button>
            </a-space>
        </a-space>
    </Node>
</template>

<script setup>
import {
	basename, dirname, join, relative,
} from 'path';
import { readFile } from 'fs/promises';
import { ipcRenderer } from 'electron';
import { updateAutoTags } from '@/utils/tags';
import writeProject from '@/utils/persistence';
import useSnowballStore from '@/store';
import Node from './Node.vue';
import { reactive, ref, computed, onMounted } from 'vue';


// Data
const worker = ref(null);
const fileList = reactive([]);
const store = useSnowballStore()

// Props
const props = defineProps({
	id: String,
	data: Object,
});

// Computed
const fileName = computed(() => {
	return props.data.path ? basename(props.data.path) : null;
})

const fileLocation = computed(() => {
	return props.data.path.length > 30
		? `${props.data.path.slice(0, 15)}...${props.data.path.slice(-15)}`
		: props.data.path;
})


// Methods
const loadFile = function(filePath) {
	const nodeData = store.workflowNode(props.id).data;
	nodeData.loading = true;
	readFile(filePath, 'utf-8').then((content) => {
		worker.value.postMessage({ content,
			preprocess: filePath.endsWith('.bib') });
		worker.value.onmessage = ({ data }) => {
			// Update auto tags
			updateAutoTags(store, data);
			// Update node data
			const project = dirname(store.projectPath);
			const location = relative(project, filePath);
			nodeData.path = location;
			// Update output cache
			store.dataflow.output[props.id] = { 
				papers: data,
				selection: data.map((paper) => paper.id)
			};
			console.log(`[ImportPapers][loadFile] Imported ${data.length} papers from ${filePath}`);
			// Stop loading animation
			nodeData.loading = false;
			// Trigger workflow
			store.runWorkflow(props.id);
			writeProject(store);
		};
		worker.value.onerror = (error) => {
			console.log('Error reading file.', error);
			this.$message.error(error.message);
			fileList = [];
			nodeData.loading = false;
		};
	});
}

const openFile = function() {
	ipcRenderer.invoke('open-file').then((filePath) => {
		if (!filePath) {
			return;
		}
		loadFile(filePath[0]);
	});
}

const reload = function() {
	if (!props.data.path) {
		store.dataflow.output[props.id] = {};
		store.runWorkflow(props.id);
		return;
	}
	loadFile(join(dirname(store.projectPath), props.data.path));
}


// Mounted
onMounted(() => {
	store.workflowNode(props.id).data.run = reload.bind(this);
	worker.value = new Worker(new URL('./workers/import.js', import.meta.url), {
		type: 'module',
	});

	console.log('importing', props.data.path);

	if (props.data.path) {
		const filePath = join(dirname(store.projectPath), props.data.path);
		console.log('Importing', filePath);
		loadFile(filePath);
	}
})
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