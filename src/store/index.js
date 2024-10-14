import { defineStore } from 'pinia';
import toposort from 'toposort';
import { filter } from '@/utils/search';
// import { processTags, updateAutoTags, updateTagIds } from '@/utils/tags';
import { processTags, updateTagIds } from '@/utils/tags';
import writeProject from '@/utils/persistence';

export default defineStore('snowball', {
    state: () => ({
        initialized: false,
        version: null,
        projectPath: '',
        flow: null,
        workflow: [
            {
                id: 'import-init', type: 'import', position: { x: 0, y: 0 }, data: {},
            },
        ],
        dataflow: {
            input: {},
            output: {},
        },
        notes: '',
        tags: [],

        user: {
            name: null,
            email: null,
            salt: null,
        },

        loading: false,

        screen: 'project',

        filter: '',
        filterTags: [],
        filterMethod: 'Boolean',
        filterChanged: false,
        filterError: false,
        filterResult: [],

        activeSheet: 'core',
        activePaper: null,
        selection: [],
    }),
    getters: {
        workflowNode: (state) => (id) => state.workflow.find((el) => el.id === id),
        allEdges: (state) => (
            (id) => state.workflow.filter((el) => el.source === id || el.target === id)
        ),
        inEdges: (state) => (id) => state.workflow.filter((el) => el.target === id),
        outEdges: (state) => (id) => state.workflow.filter((el) => el.source === id),
        running(state) {
            return state.workflow.some((element) => element.data && element.data.loading);
        },

        sheets(state) {
            return state.workflow.filter((node) => node.type === 'sheet');
        },
        currentSheet(state) {
            return state.workflow.find((node) => node.type === 'sheet' && node.id === state.activeSheet);
        },
        paperInCurrentSheet() {
            const getter = (id) => (
                this.currentSheet.data.output.data.find((paper) => paper.id === id)
            );
            return getter.bind(this);
        },

        papers() {
            const papers = [];
            this.sheets.forEach((sheetNode) => {
                if (!sheetNode.data.output || !sheetNode.data.output.data) return;
                sheetNode.data.output.data.forEach((paper) => {
                    if (!papers.includes(paper)) papers.push(paper);
                });
            });
            return papers;
        },
        currentPaper() {
            const activeSheetOutput = this.dataflow.output[this.activeSheet];
            console.log(activeSheetOutput);
            if (!activeSheetOutput || !activeSheetOutput.papers) return null;
            return activeSheetOutput.papers.find(
                (paper) => paper.id === this.activePaper,
            );
        },
        included() {
            return this.papers.filter((paper) => paper.decision === 'include');
        },
        excluded() {
            return this.papers.filter((paper) => paper.decision === 'exclude');
        },
        undecided() {
            return this.papers.filter((paper) => paper.decision === 'undecided');
        },

        tag: (state) => (id) => state.tags.find((tag) => tag.id === id),
        tagUsageCount(state) {
            const usage = {};
            // const { papers } = this;
            // console.log(this, this.papers, papers);
            state.tags.forEach((tag) => {
                usage[tag.id] = 0;
            });
            this.currentPapers.forEach((paper) => {
                const tags = processTags(state, paper);
                tags.forEach((tag) => {
                    if (!usage[tag.id]) usage[tag.id] = 0;
                    usage[tag.id] += 1;
                });
            });
            // console.log(usage);
            return usage;
        },

        currentPapers(state) {
            let currentPapers = [];
            if (state.activeSheet && this.dataflow.output[state.activeSheet]) {
                currentPapers = this.dataflow.output[state.activeSheet].papers;
                if (this.dataflow.input[state.activeSheet]) {
                    const { selection } = this.dataflow.input[state.activeSheet];
                    if (selection && Array.isArray(selection)) {
                        if (currentPapers) {
                            currentPapers = currentPapers.filter(
                                (paper) => selection.includes(paper.id),
                            );
                        }
                    }
                }
            }
            return currentPapers || [];
        },

        filteredPapers(state) {
            const papers = this.currentPapers;

            if (state.filter.length === 0 && state.filterTags.length === 0) {
                state.filterError = false;
                return papers;
            }
            if (!state.filterChanged) {
                state.filterError = false;
                return state.filterResult;
            }

            state.filterResult = papers;
            if (state.filter.length > 0) {
                try {
                    console.log('Trying to filter');
                    state.filterResult = filter(
                        state.filterMethod,
                        papers,
                        state.filter,
                        ['title', 'abstract', 'keywords'],
                    );
                    state.filterError = false;
                } catch (error) {
                    state.filterError = true;
                    console.log(error);
                }
            }

            console.log('Filter', state.filterResult.length, state.filterTags);

            // If there are tags active, then filter those as well.
            if (state.filterTags.length > 0) {
                state.filterResult = state.filterResult.filter(
                    (paper) => processTags(state, paper).some(
                        (tag) => state.filterTags.includes(tag.id),
                    ),
                );
            }

            // Update selection to only include those filtered
            const newKeys = [];
            state.filterResult.forEach((paper) => {
                if (state.selection.includes(paper.id)) {
                    newKeys.push(paper.id);
                }
            });
            state.selection = newKeys;

            // Keep this result until the filter changes again.
            state.filterChanged = false;

            return state.filterResult;
        },
    },
    actions: {
        updateTags() {
            updateTagIds(this);
            // updateAutoTags(this, this.papers);
        },

        edit(sheetId, paperId, edits) {
            const sheet = this.workflow.find((node) => node.type === 'sheet' && node.id === sheetId);
            const output = this.dataflow.output[sheetId].papers;
            if (!sheet) return;
            console.log('Editing sheet', sheet);
            sheet.data.edits[paperId] = {
                ...sheet.data.edits[paperId],
                ...edits,
            };
            console.log('updated data', sheet.data.edits[paperId]);

            // Apply the edits here to avoid having to rerun the node through all papers.
            const paper = output.find((p) => p.id === paperId);
            Object.keys(edits).forEach((key) => {
                paper[key] = edits[key];
            });
            // Then we trigger the workflow after this node.
            this.runWorkflow(sheetId);
            // Finally, don't forget to save the edits since we're not running the node.
            writeProject(this);
        },

        runWorkflow(elementId) {
            this.workflow.forEach((el) => {
                if (this.inEdges(el.id).length === 0 && this.dataflow.input[el.id]) {
                    delete this.dataflow.input[el.id];
                    if (el.data.run) el.data.run();
                }
            });

            if (!elementId) {
                console.log('No elementId specified. Running the entire workflow.');
                const edges = [];
                this.workflow.forEach((el) => {
                    if (el.source && el.target) edges.push([el.source, el.target]);
                });
                const sorted = toposort(edges);
                sorted.forEach((nodeId) => {
                    const node = this.workflowNode(nodeId);
                    console.log(node, node.data.run);
                    if (node.data.run) node.data.run();
                });
                return;
            }
            console.log('Running workflow from ', elementId);
            const outEdges = this.outEdges(elementId);
            outEdges.forEach((edge) => {
                const inEdges = this.inEdges(edge.target);
                const outputs = {};
                inEdges.forEach((inEdge) => {
                    // Handles are in format "__type_id"
                    const sourceHandle = inEdge.sourceHandle.replace(/^__/, '').split('_')[1];
                    const targetHandle = inEdge.targetHandle.replace(/^__/, '').split('_')[1];
                    if (this.dataflow.output[inEdge.sourceNode.id]) {
                        const nodeOutput = this.dataflow.output[inEdge.sourceNode.id];
                        outputs[targetHandle] = nodeOutput[sourceHandle];
                    }
                });
                this.dataflow.input[edge.targetNode.id] = outputs;
                const node = this.workflowNode(edge.targetNode.id);
                if (node.data.run) node.data.run();
            });
        },
    },
});
