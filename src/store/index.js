import { createStore } from 'vuex'

export default createStore({
    state: {
        sheets: {
            foundation: { id: 'foundation', name: 'Foundation', papers: [] }
        },
        tags: new Set()
    },
    getters: {
    },
    mutations: {
        addPapers (state, payload) {
            for (const paper of payload.papers) {
                paper['tags'] = [];
                paper['include'] = null;
                paper['notes'] = '';
                state.sheets[payload.sheet].papers.push(paper)
            }
        },

        addTag (state, tag) {
            state.tags.add(tag);
        }
    },
    actions: {
    },
    modules: {
    }
})
