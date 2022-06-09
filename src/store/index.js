import { createStore } from 'vuex'
import { writeProject, writePaper, writeSheet, writeIndex } from '@/utils/io'


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
        } else if (mutation.type === 'addSheet') {
            writeIndex(state);
            writeSheet(state, mutation.payload.id);
        }
    });
}

export default createStore({
    state: {
        projectPath: '',
        sheets: {
            core: {
                id: 'core', 
                name: 'Core', 
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
            payload.papers.sort((a, b) => {
                if (typeof a.year === 'number' && typeof b.year === 'number') {
                    return b.year - a.year;
                } else if (typeof a.year === 'string' && typeof b.year === 'number') {
                    return 1;
                } else if (typeof a.year === 'number' && typeof b.year === 'string') {
                    return -1;
                } else {
                    return 0;
                }
            })
            for (const paper of payload.papers) {
                paper['tags'] = [];
                // if (!paper.doi) paper['tags'].push({ type: 'danger', text: 'No DOI'});
                // if (!paper.abstract) paper['tags'].push({ type: 'warning', text: 'No Abstract'});

                paper['include'] = false;
                paper['notes'] = '';
                paper['sheets'] = [];

                if (state.papers[paper.id]) {
                    console.log("Existing paper", paper);
                    if (!state.sheets[payload.sheet].papers.includes(paper.id)) {
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
        },

        addSheet (state, sheet) {
            state.sheets[sheet.id] = sheet;
        }
    },
    actions: {
    },
    modules: {
    },
    plugins: [filePersistence]
})
