import { createStore } from 'vuex'
import { writeProject, writePaper, writeIndex } from '@/utils/io'


const filePersistence = (store) => {

    const ignoreEvents = ['setLoading', 'setProjectPath', 'loadProject'];
    // called when the store is initialized
    store.subscribe((mutation, state) => {
        if (ignoreEvents.includes(mutation.type)) return;
        console.log(mutation);
        if (mutation.type === 'addPapers') {
            console.log(state);
            console.log('Saving state to', state.projectPath);
            const startTime = Date.now();
            writeProject(state);
            console.log('Posting message took', Date.now() - startTime);
        } else if (mutation.type === 'updatePaper') {
            writePaper(state, mutation.payload.paper);
        } else if (mutation.type === 'addTag') {
            writeIndex(state);
        }
    });
}

export default createStore({
    state: {
        projectPath: '',
        sheets: {
            foundation: {
                id: 'foundation', 
                name: 'Foundation', 
                papers: []
            }
        },
        papers: {},
        tags: [],
        loading: false,
    },
    getters: {
    },
    mutations: {
        setLoading (state, value) {
            state.loading = value;
        },

        setProjectPath (state, path) {
            state.projectPath = path;
        },

        loadProject (state, data) {
            state.sheets = data.sheets;
            state.papers = data.papers;
            state.tags = data.tags;
        },

        addPapers (state, payload) {
            for (const paper of payload.papers) {
                paper['tags'] = [];
                paper['include'] = false;
                paper['notes'] = '';
                paper['sheets'] = [];
                if (state.papers[paper.id]) {
                    if (state.sheets[payload.sheet].papers.includes(paper.id)) {
                        state.sheets[payload.sheet].papers.push(paper.id);
                    }
                    if (!state.papers[paper.id].sheets.includes(payload.sheet)) {
                        state.papers[paper.id].sheets.push(payload.sheet);
                    }
                } else {
                    state.papers[paper.id] = paper;
                    if (!state.sheets[payload.sheet].papers.includes(paper.id)) {
                        state.sheets[payload.sheet].papers.push(paper.id);
                    }
                    if (!paper.sheets.includes(payload.sheet)) {
                        paper.sheets.push(payload.sheet);
                    }
                }
            }
        },

        updatePaper (state, payload) {
            if (!state.papers[payload.paper]) return;
            for (let [key, value] of Object.entries(payload.updates)) {
                state.papers[payload.paper][key] = value;
            }
        },

        addTag (state, tag) {
            if (!state.tags.includes(tag)) state.tags.push(tag);
        }
    },
    actions: {
    },
    modules: {
    },
    plugins: [filePersistence]
})
